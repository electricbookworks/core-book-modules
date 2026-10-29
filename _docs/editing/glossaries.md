---
title: Glossaries
categories:
  - editing
order: 17
---

# Glossaries

Glossary content comes from the [CORE unified glossary](https://github.com/electricbookworks/core-book-glossary). Its build creates a `glossary.yml` per book and language. Copy each one into the book repo, renamed to `glossary-unified.yml`:

* `_data/works/<book>/glossary-unified.yml` for the book's parent language
* `_data/works/<book>/<language>/glossary-unified.yml` for translations

Don't edit `glossary-unified.yml`: it is replaced whenever the unified glossary is updated. To change how entries display in this book (for example to add soft hyphens or non-breaking spaces), use display overrides.

## Display overrides

Put overrides in a `glossary-override.yml` file next to the relevant `glossary-unified.yml`. Each item targets a glossary entry by its `id`, and lists find-and-replace overrides for that entry's fields:

~~~ yaml
- id: consumption
  overrides:
    - field: term
      find: "consumption"
      replace: "con&shy;sumption"
    - field: definition
      find: "personal needs and wants"
      replace: "personal needs and&nbsp;wants"
~~~

* `field` can be `term`, `definition`, `example` or `cross-reference`.
* `find` is plain, case-sensitive text (not a regular expression). Every occurrence in the field is replaced.
* `replace` can contain markdown and HTML.

## Generating glossary.yml

Run:

~~~ shell
npm run eb -- glossary -b <book>
npm run eb -- glossary -b <book> -l <language>
~~~

This applies `glossary-override.yml` to `glossary-unified.yml` and writes the result to `glossary.yml` in the same folder. That `glossary.yml` is what `{% raw %}{% include glossary %}{% endraw %}` and `{% raw %}{% include definition %}{% endraw %}` use, so don't edit it by hand. If there is no overrides file, `glossary-unified.yml` is copied as is.

The command warns about overrides it could not apply (an unknown `id`, a missing field, or `find` text that no longer exists), for example after a glossary update changes a definition. Re-run it whenever you update `glossary-unified.yml` or `glossary-override.yml`, and commit the generated `glossary.yml`.

Overriding a `term` does not change its anchor (`#glossary-<id>`) or its sort position in the glossary, and `{% raw %}{% include definition term="consumption" %}{% endraw %}` still finds the entry by its original term.
