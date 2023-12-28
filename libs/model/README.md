# @cabbage-cms/model

Core domain models used to [structure content](https://docs.netlify.com/create/concepts/structured-content>). This library provides a default export that satisfies Record<ModelType, Model>

## Types of Models

Cabbage CMS uses three types of models:

`PageModel` - That which represents the shape of a page. E.G. A blog site that uses a Post model for its individual blog posts.

`DataModel` - Content objects which are meant either to stand alone and be accessed globally, or to be referenced from a page. E.G. A Header model that contains content for a site's main menu, or a blog site uses an Author model to apply rich attributes to Post content (via a reference field).

`ObjectModel` - Repeatable content that is embedded in another model (of any type). Component models are typically object models.
