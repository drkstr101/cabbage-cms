import toml from '@iarna/toml';
import chalk from 'chalk';
import fs from 'fs';
import fse from 'fs-extra';
import glob from 'glob';
import _ from 'lodash';
import path from 'path';
import yaml from 'yaml';

const INDENT = _.repeat(' ', 4);

/**
 * Iterates over array items and invokes callback function for each of them.
 * The callback must return a promise and is called with three parameters: array item,
 * item index, array itself. Callbacks are invoked serially, such that callback for the
 * following item will not be called until the promise returned from the previous callback
 * is not fulfilled.
 *
 * @param {array} array
 * @param {function} callback
 * @param {object} [thisArg]
 * @return {Promise<any>}
 */
function forEachPromise(array, callback, thisArg) {
  return new Promise((resolve, reject) => {
    function next(index) {
      if (index < array.length) {
        callback
          .call(thisArg, array[index], index, array)
          .then(() => {
            next(index + 1);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    }
    next(0);
  });
}

function mapPromise(array, callback, thisArg) {
  return new Promise((resolve, reject) => {
    const results = [];

    function next(index) {
      if (index < array.length) {
        callback
          .call(thisArg, array[index], index, array)
          .then((result) => {
            results[index] = result;
            next(index + 1);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(results);
      }
    }

    next(0);
  });
}

function reducePromise(array, callback, initValue, thisArg) {
  return new Promise((resolve, reject) => {
    function next(index, accumulator) {
      if (index < array.length) {
        callback
          .call(thisArg, accumulator, array[index], index, array)
          .then((accumulator) => {
            next(index + 1, accumulator);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(accumulator);
      }
    }

    next(0, initValue);
  });
}

function reduceObjectPromise(object, callback, initValue, thisArg) {
  return new Promise((resolve, reject) => {
    const keys = _.keys(object);
    function next(index, accumulator) {
      if (index < keys.length) {
        const key = keys[index];
        callback
          .call(thisArg, accumulator, object[key], key, object)
          .then((accumulator) => {
            next(index + 1, accumulator);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(accumulator);
      }
    }

    next(0, initValue);
  });
}

function findPromise(array, callback, thisArg) {
  return new Promise((resolve, reject) => {
    function next(index) {
      if (index < array.length) {
        const item = array[index];
        callback
          .call(thisArg, item, index, array)
          .then((result) => {
            if (result) {
              resolve(item);
            } else {
              next(index + 1);
            }
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    }

    next(0);
  });
}

function promiseAllMap(array, limit, interval, callback, thisArg) {
  return new Promise((resolve, reject) => {
    const arrayCopy = array.slice();
    const results = [];
    let index = 0;
    let runCount = 0;
    let doneCount = 0;
    let lastRunTime = null;
    let timeout = null;
    limit = limit || null;
    interval = interval || null;

    let run = () => {
      const idx = index;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      index += 1;
      runCount += 1;
      lastRunTime = process.hrtime();
      Promise.resolve(callback.call(thisArg, arrayCopy[idx], idx, arrayCopy))
        .then((result) => {
          runCount -= 1;
          doneCount += 1;
          results.push(result);
          next();
        })
        .catch((error) => {
          reject(error);
        });
      next();
    };

    if (interval) {
      const origRun = run;
      run = function () {
        if (!lastRunTime) {
          origRun();
        } else if (!timeout) {
          const diff = process.hrtime(lastRunTime);
          const diffMs = diff[0] * 1000 + diff[1] / 1000000;
          if (diffMs >= interval) {
            origRun();
          } else {
            timeout = setTimeout(origRun, interval - diffMs);
          }
        }
      };
    }

    if (limit) {
      const origRun = run;
      run = function () {
        if (runCount < limit) {
          origRun();
        }
      };
    }

    function next() {
      if (index < arrayCopy.length) {
        run();
      } else if (doneCount === arrayCopy.length) {
        resolve(results);
      }
    }

    next();
  });
}

/**
 * Recursively copies files from source to target directories.
 * The optional "options" argument is an object with an optional "processNunjucksFile"
 * and "filePathMap" fields.
 *
 * If "processNunjucksFile" function is passed, it will be invoked for every file with ".njk"
 * extension with a filepath relative to the sourceDir as its single argument.
 * This function should return the result of processing Nunjucks template.
 *
 * Files named _gitignore will be copied as .gitignore
 *
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {object} [options]
 * @param {Function} options.processNunjucksFile Function that receives filePath
 *   relative to sourceDir and returns processed file data to be stored inside targetDir
 * @param {object} options.filePathMap Map between source and target file paths.
 *   If mapped value is null, the file will not be copied.
 */
function copyFilesRecursively(sourceDir, targetDir, options, _internalOptions) {
  if (!_internalOptions) {
    _internalOptions = {
      origSourceDir: sourceDir,
      origTargetDir: targetDir,
    };
  }

  fs.readdirSync(sourceDir).forEach((fileName) => {
    const sourceFilePath = path.join(sourceDir, fileName);
    let targetFilePath = path.join(targetDir, fileName);
    const fileStat = fs.statSync(sourceFilePath);

    if (fileStat.isDirectory()) {
      copyFilesRecursively(sourceFilePath, targetFilePath, options, _internalOptions);
    } else if (fileStat.isFile()) {
      const outputPathObject = path.parse(targetFilePath);
      let data = null;
      if (outputPathObject.ext === '.njk') {
        if (
          !_.has(options, 'processNunjucksFile') ||
          !_.isFunction(options.processNunjucksFile)
        ) {
          throw new Error(
            `utils.copyFilesRecursively(): file (${sourceFilePath}) has '.njk' extension but processNunjucksFile function was not passed`
          );
        }
        const relativeSourceFilePath = path.relative(
          _internalOptions.origSourceDir,
          sourceFilePath
        );
        data = options.processNunjucksFile(relativeSourceFilePath);
        targetFilePath = path.resolve(outputPathObject.dir, outputPathObject.name);
      }
      const relativeTargetFilePath = path.relative(
        _internalOptions.origTargetDir,
        targetFilePath
      );
      if (_.has(options, ['filePathMap', relativeTargetFilePath])) {
        const mappedFilePath = _.get(options, ['filePathMap', relativeTargetFilePath]);
        if (mappedFilePath === null) {
          return;
        }
        targetFilePath = path.join(_internalOptions.origTargetDir, mappedFilePath);
      }
      if (fileName === '_gitignore') {
        targetFilePath = path.resolve(outputPathObject.dir, '.gitignore');
      }
      if (!data) {
        fse.copySync(sourceFilePath, targetFilePath);
      } else {
        fse.outputFileSync(targetFilePath, data, { mode: fileStat.mode });
      }
    } else {
      throw new Error(
        `utils.copyFilesRecursively(): file type is not supported: ${sourceFilePath}`
      );
    }
  });
}

/**
 * Copies the value at a sourcePath of the sourceObject to a targetPath of the targetObject.
 *
 * @param {Object} sourceObject
 * @param {String} sourcePath
 * @param {Object} targetObject
 * @param {String} targetPath
 * @param {Function} [transform]
 */
function copy(sourceObject, sourcePath, targetObject, targetPath, transform) {
  if (_.has(sourceObject, sourcePath)) {
    let value = _.get(sourceObject, sourcePath);
    if (transform) {
      value = transform(value);
    }
    _.set(targetObject, targetPath, value);
  }
}

function copyDefault(sourceObject, sourcePath, targetObject, targetPath, transform) {
  if (!_.has(targetObject, targetPath)) {
    copy(sourceObject, sourcePath, targetObject, targetPath, transform);
  }
}

function mergeAtPath(object, path, source) {
  // First get the existing object at path, merge it with source and then set
  // the merged object back. This ensures that if path has number like field
  // names while the original object has objects at this path, it will not
  // override the object with array
  const nodeAtPath = _.get(object, path);
  const merged = _.merge(nodeAtPath, source);
  return _.set(object, path, merged);
}

function omitByNil(object) {
  return _.omitBy(object, _.isNil);
}

function rename(object, oldPath, newPath) {
  if (_.has(object, oldPath)) {
    _.set(object, newPath, _.get(object, oldPath));
    oldPath = _.toPath(oldPath);
    if (oldPath.length > 1) {
      object = _.get(object, _.initial(oldPath));
    }
    delete object[_.last(oldPath)];
  }
}

function append(object, path, value) {
  if (!_.has(object, path)) {
    _.set(object, path, []);
  }
  _.get(object, path).push(value);
}

function concat(object, path, value) {
  if (!_.has(object, path)) {
    _.set(object, path, []);
  }
  _.set(object, path, _.get(object, path).concat(value));
}

function indent(str, indent, indentFirst = false) {
  if (_.isNumber(indent)) {
    indent = _.repeat(INDENT, indent);
  }
  return (indentFirst ? indent : '') + str.split('\n').join(`\n${indent}`);
}

function pascalCase(str) {
  return _.upperFirst(_.camelCase(str));
}

export async function readDirRec(dir, options) {
  const dirExists = await fse.pathExists(dir);
  if (!dirExists) {
    return [];
  }
  const rootDir = _.get(options, 'rootDir', dir);
  const files = await fse.readdir(dir);
  const result = await mapPromise(files, async (file) => {
    const filePath = path.join(dir, file);
    const relFilePath = path.relative(rootDir, filePath);
    const stats = await fse.stat(filePath);
    if (_.has(options, 'filter') && !options.filter(relFilePath, stats)) {
      return Promise.resolve();
    }
    if (stats.isDirectory()) {
      return readDirRec(filePath, { ...options, rootDir });
    } else if (stats.isFile()) {
      return relFilePath;
    } else {
      return null;
    }
  });
  return _.chain(result).compact().flatten().value();
}

export function readDirGlob(dir, options) {
  let dirPattern = dir;
  // default to listing all files recursively
  if (!glob.hasMagic(dirPattern)) {
    dirPattern = path.join(dir, '**/*');
  }
  return new Promise((resolve, reject) => {
    glob(dirPattern, _.get(options, 'globOptions', {}), (err, files) => {
      if (!_.isEmpty(err)) {
        return reject(err);
      }
      resolve(
        _.compact(
          files.map((file) => {
            if (_.has(options, 'filter') && !options.filter(file)) {
              return null;
            }
            return file;
          })
        )
      );
    });
  });
}

export function readDirRecSync(dir, options) {
  let list = [];
  const dirExists = fse.pathExistsSync(dir);
  if (!dirExists) {
    return list;
  }
  const files = fs.readdirSync(dir);
  _.forEach(files, (file) => {
    const filePath = path.join(dir, file);
    if (_.has(options, 'filter') && !options.filter(filePath)) {
      return;
    }
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      list = list.concat(readDirRecSync(filePath, options));
    } else if (stats.isFile()) {
      list.push(filePath);
    }
  });
  return list;
}

function fieldPathToString(fieldPath) {
  return _.reduce(
    fieldPath,
    (accumulator, fieldName, index) => {
      if (_.isString(fieldName) && /\W/.test(fieldName)) {
        // field name is a string with non alphanumeric character
        accumulator += `['${fieldName}']`;
      } else if (_.isNumber(fieldName)) {
        accumulator += `[${fieldName}]`;
      } else {
        if (index > 0) {
          accumulator += '.';
        }
        accumulator += fieldName;
      }
      return accumulator;
    },
    ''
  );
}

function hrtimeAndPrint(time) {
  const res = process.hrtime(time);
  return printHRTime(res);
}

function printHRTime(time) {
  const precision = 3;
  if (time[0] > 0) {
    return _.round(time[0] + time[1] / 1e9, precision) + 'sec';
  } else if (time[1] >= 1e6) {
    return _.round(time[1] / 1e6, precision) + 'ms';
  } else if (time[1] >= 1e3) {
    return _.round(time[1] / 1e3, precision) + 'µs';
  } else {
    return _.round(time[1], precision) + 'ns';
  }
}

/**
 * Recursively iterates over elements of a collection and invokes iteratee for each element.
 *
 * @param {*} value The value to iterate
 * @param {Function} iteratee The iteratee function
 * @param {string|number} key The key of the `value` if the `object` is an Object, or the index of the `value` if the `object` is an Array
 * @param {Object} object The parent object of `value`.
 */
function forEachDeep(value, iteratee, key, object) {
  iteratee(value, key, object);
  if (_.isPlainObject(value)) {
    _.forEach(value, (v, k) => {
      forEachDeep(v, iteratee, k, value);
    });
  } else if (_.isArray(value)) {
    _.forEach(value, (v, k) => {
      forEachDeep(v, iteratee, k, value);
    });
  }
}

/**
 * Gets the value at the first path of object having non undefined value.
 * If all paths resolve to undefined values, the defaultValue is returned.
 *
 * @param {Object} object The object to query.
 * @param {Array<String | Array<String>>} paths The property paths to search for.
 * @param {*} [defaultValue] The value returned if all paths resolve to undefined values
 * @returns {*}
 */
function getFirst(object, paths, defaultValue) {
  const result = _(object).at(paths).reject(_.isUndefined).first();
  return _.isUndefined(result) ? defaultValue : result;
}

export function getFirstExistingFile(fileNames, inputDir) {
  return findPromise(fileNames, (fileName) => {
    const absPath = path.resolve(inputDir, fileName);
    return fse.exists(absPath);
  });
}

async function parseFirstExistingFile(fileNames, inputDir) {
  const filePath = await getFirstExistingFile(fileNames, inputDir);
  if (filePath) {
    return await parseFile(filePath);
  } else {
    return null;
  }
}

function getFirstExistingFileSync(fileNames, inputDir) {
  return _.chain(fileNames)
    .map((fileName) => path.resolve(inputDir, fileName))
    .find((filePath) => fs.existsSync(filePath))
    .value();
}

function parseFirstExistingFileSync(fileNames, inputDir) {
  const filePath = getFirstExistingFileSync(fileNames, inputDir);
  if (filePath) {
    return parseFileSync(filePath);
  } else {
    return null;
  }
}

function parseFile(filePath) {
  return fse.readFile(filePath, 'utf8').then((data) => {
    return parseDataByFilePath(data, filePath);
  });
}

function parseFileSync(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return parseDataByFilePath(data, filePath);
}

function parseDataByFilePath(string, filePath) {
  const extension = path.extname(filePath).substring(1);
  let data;
  switch (extension) {
    case 'yml':
    case 'yaml':
      string = string.replace(/\n---\s*$/, '');
      data = yaml.safeLoad(string, { schema: yaml.JSON_SCHEMA });
      break;
    case 'json':
      data = JSON.parse(string);
      break;
    case 'toml':
      data = toml.parse(string);
      break;
    case 'markdown':
    case 'mdx':
    case 'md':
      data = parseMarkdownWithFrontMatter(string);
      break;
    case 'js':
    case 'jsx':
      data = string;
      break;
    default:
      throw new Error(
        `parseDataByFilePath error, extension '${extension}' of file ${filePath} is not supported`
      );
  }
  return data;
}

function outputData(filePath, data) {
  const res = stringifyDataByFilePath(data, filePath);
  return fse.outputFile(filePath, res);
}

async function outputDataIfNeeded(filePath, data) {
  const res = stringifyDataByFilePath(data, filePath);
  const fileExists = await fse.pathExists(filePath);
  const existingContent = fileExists ? await fse.readFile(filePath, 'utf8') : null;
  if (!fileExists || res !== existingContent) {
    await fse.outputFile(filePath, res);
    return true;
  }
  return false;
}

function outputDataSync(filePath, data) {
  const res = stringifyDataByFilePath(data, filePath);
  fse.outputFileSync(filePath, res);
}

function stringifyDataByFilePath(data, filePath) {
  const extension = path.extname(filePath).substring(1);
  let result;
  switch (extension) {
    case 'yml':
    case 'yaml':
      result = yaml.safeDump(data, { noRefs: true });
      break;
    case 'json':
      result = JSON.stringify(data, null, 4);
      break;
    case 'toml':
      result = toml.stringify(data);
      break;
    case 'markdown':
    case 'mdx':
    case 'md':
      result =
        '---\n' +
        yaml.safeDump(data.frontmatter, { noRefs: true }) +
        '---\n' +
        _.get(data, 'markdown', '');
      break;
    case 'js':
    case 'jsx':
      result = data;
      break;
    default:
      throw new Error(
        `stringifyDataByFilePath error, extension '${extension}' of file ${filePath} is not supported`
      );
  }
  return result;
}

function parseMarkdownWithFrontMatter(string) {
  string = string.replace('\r\n', '\n');
  let frontmatter = null;
  let markdown = string;
  const frontMatterTypes = [
    {
      type: 'yaml',
      startDelimiter: '---\n',
      endDelimiter: '\n---',
      parse: (string) => yaml.safeLoad(string, { schema: yaml.JSON_SCHEMA }),
    },
    {
      type: 'toml',
      startDelimiter: '+++\n',
      endDelimiter: '\n+++',
      parse: (string) => toml.parse(string),
    },
    {
      type: 'jsonmd',
      startDelimiter: '---json\n',
      endDelimiter: '\n---',
      parse: (string) => JSON.parse(string),
    },
    {
      type: 'json',
      startDelimiter: '{\n',
      endDelimiter: '\n}',
      parse: (string) => JSON.parse(`{${string}}`),
    },
  ];
  _.forEach(frontMatterTypes, (fmType) => {
    if (string.startsWith(fmType.startDelimiter)) {
      const index = string.indexOf(fmType.endDelimiter);
      if (index !== -1) {
        // The end delimiter must be followed by EOF or by a new line (possibly preceded with spaces)
        // For example ("." used for spaces):
        //   |---
        //   |title: Title
        //   |---...
        //   |
        //   |Markdown Content
        //   |
        // "index" points to the beginning of the second "---"
        // "endDelimEndIndex" points to the end of the second "---"
        // "afterEndDelim" is everything after the second "---"
        // "afterEndDelimMatch" is the matched "...\n" after the second "---"
        // frontmatter will be: {title: "Title"}
        // markdown will be "\nMarkdown Content\n" (the first \n after end delimiter is discarded)
        const endDelimEndIndex = index + fmType.endDelimiter.length;
        const afterEndDelim = string.substring(endDelimEndIndex);
        const afterEndDelimMatch = afterEndDelim.match(/^\s*?(\n|$)/);
        if (afterEndDelimMatch) {
          const data = string.substring(fmType.startDelimiter.length, index);
          frontmatter = fmType.parse(data);
          markdown = afterEndDelim.substring(afterEndDelimMatch[0].length);
        }
      }
    }
  });
  return {
    frontmatter: frontmatter,
    markdown: markdown,
  };
}

function deepFreeze(obj) {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      this.deepFreeze(obj[prop]);
    }
  });

  return obj;
}

function failFunctionWithTag(tag) {
  return function fail(message) {
    throw new Error(`[${tag}] ${message}`);
  };
}

function assertFunctionWithFail(fail) {
  return function assert(value, message) {
    if (!value) {
      fail(message);
    }
  };
}

function createLogger(scope, transport) {
  const levels = ['log', 'info', 'debug', 'error'];
  const logger = transport || console;
  const noop = () => {};
  const obj = {};

  levels.forEach((level) => {
    obj[level] = (...args) => {
      (logger[level] || noop)(`[${scope}]`, ...args);
    };
  });

  return obj;
}

function logObject(object, title) {
  const label = title ? title : '';
  console.group(label);
  _.forEach(object, (value, key) => {
    if (_.isString(value)) {
      value = `"${value}"`;
    }
    console.log(`${key}: ${chalk.green(value)}`);
  });
  console.groupEnd(label);
}

function joinPathAndGlob(pathStr, glob) {
  glob = globToArray(glob);
  return _.map(glob, (globPart) => _.compact([pathStr, globPart]).join('/'));
}

function globToArray(glob) {
  return _.chain(glob)
    .castArray()
    .compact()
    .reduce((accum, globPart) => {
      const globParts = _.chain(globPart).trim('{}').split(',').compact().value();
      return _.concat(accum, globParts);
    }, [])
    .value();
}

/**
 * Inverse of _.toPath()
 *
 * fromPath(['foo', 'hello.world', 'bar'])
 * => 'foo["hello.world"].bar'
 *
 * @param {Array} pathArray
 * @return {String}
 */
function fromPath(pathArray) {
  return _.reduce(
    pathArray,
    (accum, pathPart) => {
      if (_.isString(pathPart) && pathPart.indexOf('.') !== -1) {
        return accum + `["${pathPart}"]`;
      }
      return accum + (accum ? '.' : '') + pathPart;
    },
    ''
  );
}

function omitDeep(object, paths) {
  if (_.isPlainObject(object)) {
    return _.mapValues(_.omit(object, paths), (val) => omitDeep(val, paths));
  } else if (_.isArray(object)) {
    return _.map(object, (val) => omitDeep(val, paths));
  }
  return object;
}

/**
 * Reduces the provided `data` using the provided reducer function `reducerFunc`
 * into an object with `data` and `errors` attributes.
 *
 * For every item in the provided `data, the reducer function is invoked with
 * `value` and `key` arguments. The reducer function should return an object
 * with optional `data` and `error` properties, or `null`.
 *
 * ```
 * reducerFunc(value, key) => { data, errors }
 * ```
 *
 * When reducer function returns an object with a `data` property, its value
 * is added to the `data` property of final result. If the original `data` is an
 * object, then the `data` returned by the reducer function is added under the
 * same `key` that was passed to the reducer function. If the original `data` is
 * an array, then the value is pushed to the reduced data.
 * If `data` property is missing, the reduced data will not include that item.
 *
 * When reducer function returns an object with `errors`, which can be an array
 * of error messages or a single error message, these errors are added to the
 * reduced result under `errors` property.
 *
 * @param {Array|Object} data
 * @param {Function} reducerFunc
 * @return {{data: Array|Object, errors: Array}}
 */
export function dataReducerSync(data, reducerFunc) {
  const isArray = Array.isArray(data);
  const accum = {
    data: isArray ? [] : {},
    errors: [],
  };
  const accumFunc = isArray
    ? (accum, value, key) => (accum.data = accum.data.concat(value))
    : (accum, value, key) => (accum.data[key] = value);

  const reducer = (accum, value, key) => {
    const result = reducerFunc(value, key);
    if (_.has(result, 'data')) {
      const resValue = _.get(result, 'data');
      accumFunc(accum, resValue, key);
    }
    if (_.has(result, 'errors')) {
      accum.errors = accum.errors.concat(result.errors);
    }
    return accum;
  };

  return _.reduce(data, reducer, accum);
}

/**
 * Same as dataReducerSync but receives asynchronous reducerFunc
 *
 * @param {Array|Object} data
 * @param {Function} reducerFunc
 * @return {{data: Array|Object, errors: Array}}
 */
export async function dataReducer(data, reducerFunc) {
  const isArray = Array.isArray(data);
  const accum = {
    data: isArray ? [] : {},
    errors: [],
  };
  const reduceFunc = isArray ? reducePromise : reduceObjectPromise;
  const accumFunc = isArray
    ? (accum, value, key) => (accum.data = accum.data.concat(value))
    : (accum, value, key) => (accum.data[key] = value);

  const reducer = async (accum, value, key) => {
    const result = await reducerFunc(value, key);
    if (_.has(result, 'data')) {
      const resValue = _.get(result, 'data');
      accumFunc(accum, resValue, key);
    }
    if (_.has(result, 'errors')) {
      accum.errors = accum.errors.concat(result.errors);
    }
    return accum;
  };

  return reduceFunc(data, reducer, accum);
}

const JSX_DECODE_ENTITIES = _.invert(JSX_ENCODE_ENTITIES);

function encodeJsx(data) {
  return (
    data &&
    Object.keys(JSX_ENCODE_ENTITIES).reduce((accum, entity) => {
      return accum.replace(entity, JSX_ENCODE_ENTITIES[entity]);
    }, data)
  );
}

function decodeJsx(data) {
  return (
    data &&
    Object.keys(JSX_DECODE_ENTITIES).reduce((accum, entity) => {
      return accum.replace(entity, JSX_DECODE_ENTITIES[entity]);
    }, data)
  );
}

function replaceInRange(str, range, stringToInsert) {
  return str.substr(0, range[0]) + stringToInsert + str.substr(range[1], str.length);
}

function isRelevantReactData(data) {
  return (
    data &&
    data.length < 100 * 1024 && // 100kb
    (data.includes('react') || data.includes('React'))
  );
}

export function convertToPosixFilePath(filePath) {
  if (path.sep === path.posix.sep) {
    return filePath;
  }
  if (!filePath) {
    return filePath;
  }
  // convert 'c:\foo\bar' to '/c/foo/bar'
  return filePath
    .replace(/^(\w):/, '/$1')
    .split(path.sep)
    .join(path.posix.sep);
}
