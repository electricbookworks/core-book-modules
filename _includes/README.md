# Includes

Includes are files that can be inserted in other files with the Liquid `include` tag. E.g. where the tag `{% include share.html %}` appears, Jekyll will insert the contents of the file `_includes/share.html`.

Files in this folder without file extensions are intended for use in markdown. This keeps their syntax neat and intuitive, as if the filename is just a keyword. E.g.

``` liquid
{% include metadata %}
```

Files in this folder with file extensions tend to be code templates used in rendering processes. The file extension makes it easier for code editors to apply useful syntax highlighting.

Subfolders can be used to organise groups of files, such as `icons`. When including a file from a subfolder, include the subfolder in the include tag, e.g.

``` liquid
{% include icons/email.svg %}
```

Do not include book content in `_includes`. If there is a good reason to use an include as repeatable, template book content, use the relevant content repo's `_includes-custom` directory.
