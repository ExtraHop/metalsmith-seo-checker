metalsmith-seo-checker
==========================

This plugin provides a simple way to ensure that front matter values regarding SEO are valid.

You can provide defaults for SEO parameters, or mark them as required by setting them to true.
This should be combined with something in your templating language that places these values
where they belong. An example header that uses handlebars templating can be seen at
`/examples/seo-header.html`

This plugin manipulates values within an seo object inside of your front-matter, with one
exception. The one exception is the title property which is expected to be set on the base
front matter object.

SEO Checker will also check for a `private` flag on the front matter. If this flag is found
and there is no `seo.robots` provided `seo.robots` will be set to 'noindex, nofollow'.

With this set of options:

```js
{
    ignoreFiles: ['special.html'],
    trailingSlash: true, // Append a trailing slash to the canonical url
    lengths: {
        title: 60, // This is the default value
        description: 160 // This is the default value
    },
    seo: {
        title: true, // This is the default value
        description: 'Foo Bar Baz', // There is no default for this
        robots: 'index, follow' // This is the default value
    },
    ogp: {
        defaultType: 'website', // This is the default value
        defaultImage: 'www.example.org/myImage.png', // The default value for this is false
        ignoreMissingImage: false // This is the default value
    }
}
```

The `lengths` block sets up max string length checks on different fields. The `seo` block
defines which fields are required, or have a default value. Finally the `ogp` block
defines attribute checks that are specific to the [Open Graph Protocol](http://ogp.me).

In english this config block is ensuring that we have a title on the base front matter and
that it is no longer than 60 characters. We then provide a default description of 'Foo Bar
Baz' and ensure that all `seo.descriptions` are less than 160 characters. We are also
ensuring that any page without a `seo.robots` field defined will have 'index, follow' set.
Finally the ogp config ensures that for any page that has no `seo.ogp.type` we set the type
to 'website', and for any page without an image we can provide a default image. The
`ignoreMissingImage` config determines how the plugin will react to there being no
`seo.ogp.image` (after applying the default image provided).
