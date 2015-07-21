# Russiandoll

<img src="https://raw.githubusercontent.com/christophemarois/russiandoll/master/russiandoll.png" height="150">

Russiandoll is a writing software that transforms a special syntax into **interactive pieces of sentence**. Russiandoll is great for **writing letters and novels** because of the vocal pace it gives to the text, amongst other unique literary devices. Russiandoll renders standard HTML that can be easily embedded in personal websites or blogs, or sent as a stand-alone HTML file that you can send to people or host on the web.

## Syntax

A Russiandoll document is built around paragraphs. Paragraphs contain *fragment links* that open their corresponding *fragments*. Fragments can be infinitely nested in fragments, just like russian dolls.

Fragment links, paragraphs and fragments are linked by **the id they share**, or **the sequential order in which they appear**.

**Note on ids:** *Hidden identifier* (or *ids*) should only contain **alphanumeric** (including most latin characters like `éèàêâ`), **dashes, underscores or apostrophes** (`-_'`). For example, `>What's-happening` is a valid id whereas `>What's happening?` is not.

### Paragraphs

A paragraph is noted `>id`, where `id` is the hidden identifier of the paragraph, that a fragment link with the same id will open. A paragraph without an id will be displayed by default.

### Fragments

A paragraph is noted `{fragment text}` or `{id:fragment text}`, where `id` is the hidden identifier of the fragment, that a fragment link with the same id will open.

### Fragment links

A fragment link is noted `[link text]` or `[link text]#id` where `id` is the hidden identifier of the fragment or paragraph it should open.

### Inline elements

Russiandoll supports some markdown-like inline tags that you can combine:

Type|Markup|Result
---|---|---
Bold|`**Bold**` or `__Bold__`|<strong>Bold</strong>
Italic|`*Italic*` or `_Italic_`|<em>Italic</em>
Strikethrough|`~~Strikethrough~~`|<del>Strikethrough</del>
link|`@link to google(http://www.google.com)`|<a href="http://www.google.com" target="_blank">link to google</a>
image|`!(path/or/url/to.jpg)`|<img src="https://raw.githubusercontent.com/christophemarois/russiandoll/master/russiandoll.png" height="40">


