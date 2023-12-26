import _ from 'lodash';
import micromatch from 'micromatch';
import path from 'path';
import { LOADER_EXCLUDED_FILES } from './consts';
import { getModelByQuery } from './model-matcher';
import {
  convertToPosixFilePath,
  dataReducer,
  dataReducerSync,
  getFirstExistingFile,
  readDirRec,
} from './utils';

function isSubFolder(childFolderPath, parentFolderPath) {
  childFolderPath = _.compact(_.split(_.trim(childFolderPath, '/'), '/'));
  parentFolderPath = _.compact(_.split(_.trim(parentFolderPath, '/'), '/'));
  return _.isEqual(childFolderPath.slice(0, parentFolderPath.length), parentFolderPath);
}

function inferConfigFilePathFromSchema(schema) {
  const ssgName = _.get(schema, 'ssgName');
  if (ssgName === 'gatsby') {
    return ['site-metadata.json'];
  } else if (ssgName === 'hugo') {
    return ['config.yaml', 'config.yml', 'config.toml', 'config.json', 'theme.toml'];
  } else if (ssgName === 'jekyll') {
    return ['_config.yml', '_config.yaml', '_config.toml'];
  }
  return null;
}

async function loadConfigFile(configFiles, absProjDirPath, schema, modelsByName) {
  if (_.isEmpty(configFiles)) {
    return { data: null, errors: [] };
  }

  const configFilePath = await getFirstExistingFile(configFiles, absProjDirPath);
  if (!configFilePath) {
    return { data: null, errors: [] };
  }

  const absPath = path.resolve(absProjDirPath, configFilePath);
  const result = await parseFileWithErrors(absPath);
  if (!result.data) {
    return { data: null, errors: result.errors };
  }

  const models = _.get(schema, 'models');
  const model = _.find(models, _.matches({ type: 'config' }));
  if (!model) {
    const message = 'config model not found';
    console.error(`[git-content-loader] ${message}`);
    return { data: null, errors: [message] };
  }

  return addMetadata(result.data, model, { filePath: configFilePath, modelsByName });
}

async function loadData({ dirPath, schema, modelsByName, excludeFiles }) {
  const dataDir = _.get(schema, 'dataDir');
  if (_.isNil(dataDir)) {
    return { data: [], errors: [] };
  }

  const models = _.get(schema, 'models');
  const dataModels = _.filter(models, _.matches({ type: 'data' }));
  const absDataDirPath = path.join(dirPath, dataDir);
  const sortedFilePaths = await readDir(absDataDirPath, excludeFiles);

  return dataReducer(sortedFilePaths, async (relFilePath) => {
    const absFilePath = path.join(absDataDirPath, relFilePath);
    const projRelPath = path.join(dataDir, relFilePath);
    const result = await parseFileWithErrors(absFilePath);
    if (!result.data) {
      return { errors: result.errors };
    }
    try {
      const model = matchObjectToModel(result.data, dataModels, relFilePath, ['type'], ['name']);
      result.data = normalizeDataObject(result.data, model);
      return addMetadata(result.data, model, { filePath: projRelPath, modelsByName });
    } catch (error) {
      console.error(`[git-content-loader] ${error.message}`);
      return { errors: [error.message] };
    }
  });
}

async function loadPages({ dirPath, schema, modelsByName, excludeFiles }) {
  const pagesDir = _.get(schema, 'pagesDir');
  if (_.isNil(pagesDir)) {
    return { data: [], errors: [] };
  }

  const pageLayoutKey = _.get(schema, 'pageLayoutKey', 'layout');
  const models = _.get(schema, 'models');
  const pageModels = _.filter(models, _.matches({ type: 'page' }));
  const absPagesDirPath = path.join(dirPath, pagesDir);
  const sortedFilePaths = await readDir(absPagesDirPath, excludeFiles);

  return dataReducer(sortedFilePaths, async (relFilePath) => {
    const absFilePath = path.join(absPagesDirPath, relFilePath);
    const projRelPath = path.join(pagesDir, relFilePath);
    const result = await parseFileWithErrors(absFilePath);
    if (!result.data) {
      return { errors: result.errors };
    }
    try {
      const model = matchObjectToModel(result.data, pageModels, relFilePath, pageLayoutKey, [
        'layout',
      ]);
      result.data = normalizePageObject(result.data, model);
      return addMetadata(result.data, model, { filePath: projRelPath, modelsByName });
    } catch (error) {
      console.error(`[git-content-loader] ${error.message}`);
      return { errors: [error.message] };
    }
  });
}

async function readDir(absModelDirPath, excludeFiles) {
  const modelRelFilePaths = await readDirRec(absModelDirPath, {
    filter: (filePath, stats) =>
      !_.some(excludeFiles, (exclude) => micromatch.isMatch(filePath, exclude)) &&
      (!stats.isFile() ||
        ['md', 'markdown', 'mdx', 'yml', 'yaml', 'json', 'toml'].includes(
          path.extname(filePath).substring(1)
        )),
  });
  return modelRelFilePaths.slice().sort();
}

function parseFileWithErrors(filePath) {
  return utils
    .parseFile(filePath)
    .then((data) => {
      const extension = path.extname(filePath).substring(1);
      // transform markdown files by unwrapping 'frontmatter' and renaming 'markdown' to 'markdown_content'
      // { frontmatter: { ...fields }, markdown: '...md...' }
      // =>
      // { ...fields, markdown_content: '...md...' }
      if (
        ['md', 'markdown', 'mdx'].includes(extension) &&
        _.has(data, 'frontmatter') &&
        _.has(data, 'markdown')
      ) {
        data = _.assign(data.frontmatter, { markdown_content: data.markdown });
      }
      return { data, errors: [] };
    })
    .catch((error) => {
      const message = `error loading file, file: ${filePath}, error: ${error.message}`;
      console.log(`[git-content-loader] ${message}`);
      return { data: null, errors: [message] };
    });
}

function matchObjectToModel(object, models, filePath, objectTypeKeyPath, modelTypeKeyPath) {
  const { model, error } = getModelByQuery(
    {
      filePath: filePath,
      type: objectTypeKeyPath ? _.get(object, objectTypeKeyPath, null) : null,
      modelTypeKeyPath: modelTypeKeyPath,
    },
    models
  );
  if (error) {
    throw error;
  }
  return model;
}

function normalizeDataObject(data, model) {
  if (_.get(model, 'isList', false) && _.isArray(data)) {
    data = { items: data };
  }
  return data;
}

function normalizePageObject(page, model) {
  if (_.get(model, 'hideContent', false)) {
    page = _.omit(page, 'markdown_content');
  }
  return page;
}

function addMetadata(
  data,
  model,
  { filePath, modelsByName, dataFieldPath = [], modelFieldPath = null }
) {
  const fieldModels = _.get(model, 'fields', {});
  modelFieldPath = modelFieldPath || [model.name];
  modelFieldPath = _.concat(modelFieldPath, 'fields');

  data = _.assign(data, {
    __metadata: _.omitBy(
      {
        srcObjectId: dataFieldPath.length === 0 ? convertToPosixFilePath(filePath) : null,
        srcModelName: _.get(model, 'name', null),
        isList: _.get(model, 'isList', false) ? true : null,
        // todo: pass gitlog from container and add this data
        // updatedBy: null,
        // updatedAt: null,
        // createdAt: null,
        // createdBy: null,
        // status: null
      },
      _.isNil
    ),
  });

  return dataReducerSync(data, (fieldValue, fieldName) => {
    // do not process the __metadata field
    if (fieldName === '__metadata') {
      return {
        data: fieldValue,
      };
    }

    if (!fieldValue) {
      return {
        data: fieldValue,
      };
    }

    // pass through field values of fields not defined in model
    const fieldModel = _.find(fieldModels, { name: fieldName });
    if (!fieldModel) {
      return {
        data: fieldValue,
      };
    }

    let context = {
      filePath,
      modelsByName,
      dataFieldPath: _.concat(dataFieldPath, fieldName),
      modelFieldPath: _.concat(modelFieldPath, fieldName),
    };

    if (fieldModel.type === 'list') {
      const itemModel = _.get(fieldModel, 'items');
      const itemsType = _.get(itemModel, 'type');
      if (['object', 'model', 'reference'].includes(itemsType)) {
        context = {
          ...context,
          modelFieldPath: _.concat(context.modelFieldPath, 'items'),
        };
        return dataReducerSync(fieldValue, (item, idx) => {
          return addMetadataByField(item, itemModel, {
            ...context,
            dataFieldPath: _.concat(context.dataFieldPath, idx),
          });
        });
      }
    }

    return addMetadataByField(fieldValue, fieldModel, context);
  });
}

function addMetadataByField(fieldValue, fieldModel, context) {
  const fieldType = fieldModel.type;
  const modelsByName = context.modelsByName;
  if (fieldType === 'object') {
    return addMetadata(fieldValue, fieldModel, context);
  } else if (fieldType === 'model') {
    const modelNames = _.get(fieldModel, 'models', []);
    if (!modelNames || !_.isArray(modelNames) || modelNames.length < 1) {
      return {
        data: fieldValue,
        errors: [
          `Field of type 'model' must have a 'models' property with an array of at least one model name, ${positionInSchema(
            context
          )}`,
        ],
      };
    }
    if (modelNames.length === 1) {
      const modelName = modelNames[0];
      if (!_.has(modelsByName, modelName)) {
        return {
          data: fieldValue,
          errors: [
            `The 'models' property of a field of type 'model' must reference an existing model, ${positionInSchema(
              context
            )}`,
          ],
        };
      }
      return addMetadata(fieldValue, modelsByName[modelName], {
        ...context,
        modelFieldPath: [modelName],
      });
    }
    if (!_.has(fieldValue, 'type')) {
      return {
        data: fieldValue,
        errors: [
          `The object referenced by a field of type 'model' with multiple models must specify the 'type' property, ${positionInData(
            context
          )}`,
        ],
      };
    }
    if (!_.has(modelsByName, fieldValue.type)) {
      return {
        data: fieldValue,
        errors: [
          `The 'type' property of an object referenced by a field of type 'model' must reference an existing model, ${positionInData(
            context
          )}`,
        ],
      };
    }
    return addMetadata(fieldValue, modelsByName[fieldValue.type], {
      ...context,
      modelFieldPath: [fieldValue.type],
    });
  } else if (fieldType === 'reference') {
    // Generally, objects referenced by "reference" fields will be processed independently as global objects.
    // But, "reference" fields in stackbit.yaml ~0.2.0 are treated as "models" fields
    if (_.has(fieldValue, 'type') && _.has(modelsByName, fieldValue.type)) {
      return addMetadata(fieldValue, modelsByName[fieldValue.type], {
        ...context,
        modelFieldPath: [fieldValue.type],
      });
    }
  }
  return {
    data: fieldValue,
  };
}

function positionInSchema(context) {
  return `location: stackbit.yaml:${context.modelFieldPath.join('.')}`;
}

function positionInData(context) {
  return `location: ${context.filePath}:${context.dataFieldPath.join('.')}`;
}

export default async function loadContent({ dirPath, schema }) {
  const dataDir = _.get(schema, 'dataDir');
  const pagesDir = _.get(schema, 'pagesDir');
  const configFiles = inferConfigFilePathFromSchema(schema);
  const excludePages = _.get(schema, 'excludePages', []);
  const modelsByName = _.keyBy(schema.models, 'name');

  // push default excludes
  excludePages.push(...LOADER_EXCLUDED_FILES);

  // if dataDir is a subfolder of pagesDir (e.g., dataDir: 'data', pagesDir: '')
  // then exclude dataDir recursively shen loading pages (e.g., excludePages: 'data/**/*')
  if (!_.isEmpty(dataDir) && isSubFolder(dataDir, pagesDir)) {
    excludePages.push(_.trim(dataDir, '/') + '/**/*');
  }
  if (pagesDir === '') {
    excludePages.push('node_modules/**/*');
    if (!_.isEmpty(configFiles)) {
      excludePages.push(...configFiles);
    }
    if (!_.isEmpty(_.get(schema, 'publishDir'))) {
      excludePages.push(_.trim(schema.publishDir, '/') + '/**/*');
    }
  }

  // load files, match files to models, normalize data and add metadata
  const configRes = await loadConfigFile(configFiles, dirPath, schema, modelsByName);
  const dataRes = await loadData({ dirPath, schema, modelsByName });
  const pagesRes = await loadPages({ dirPath, schema, modelsByName, excludeFiles: excludePages });

  return {
    data: _.compact(_.concat(configRes.data, dataRes.data, pagesRes.data)),
    errors: _.concat(configRes.errors, dataRes.errors, pagesRes.errors),
    loadedContentDirs: _.compact([dataDir, pagesDir]),
  };
}
