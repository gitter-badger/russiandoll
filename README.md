# Russiandoll

Russiandoll is a **plain text formatting syntax that delivers literary content in interactive, foldable pieces of sentence**, inspired by [Alan Trotter](https://twitter.com/alantrotter)'s [website](http://greaterthanorequalto.net/). It also borrows the design philosophy of [Markdown](http://daringfireball.net/projects/markdown/), i.e. making a complex structure easily readable in plain text, as well as some of its syntactic elements.

Because an image is worth a thousand words, a working, live demo will shortly be put online.

## Syntax

Russiandoll is [indentation-based](https://en.wikipedia.org/wiki/Off-side_rule), which means that the level of indentation specifies the scope of the declarations. Like most indentation-based languages (Python, Ruby, etc), it doesn't matter whether you use spaces or tabs to indent your declarations.

Because it has literary purposes, Russiandoll is built around **paragraphs** that contain **fragment links** and **branches**. The fragment links trigger the branches and make them appear.

Paragraph and branches share the same symbol, `>`. In the case of paragraphs, their content is displayed by default. The branches are only revealed when their trigger links are clicked.

### Paragraphs 

The first indentation level of a Russiandoll document should only contain paragraphs. To create a paragraph, start a line with `>` and nest some content inside of it.

##### Example: Simple paragraph

```
>
  This is the first line of the story.
```

You can also write your text on multiple lines. Just be sure to add spaces at the end of a line if you want to separate it from the next one.

##### Example: Multiline paragraph

```
>
  This is the first 
  line of the 
  story 
  .
```

### Fragment links and branches

The branches are the nested parts of a sentence. They only unfold when their fragment links are clicked. A fragment link should be wrapped in square brackets `[]`. When clicked, it will open its corresponding branch.

**Shortcut**: If you only have one branch nested inside one, you can skip the branch symbol `>`.

##### Example: New branch

```
>
  This new paragraph is pretty [short]. 
  	>
      But coupled with this hidden sentence it isn't!
```

##### Example: New branch (shortcut)

```
>
  This only has one [link].
    So I can skip the new branch symbol!
```

When several fragment links are present in the same sentence, they will open their corresponding branches, according to their order of appearance.

```
>
  I have three branches: [a], [b] and [c].
  	>
  	  I'm opened by a
  	>
  	  I'm opened by b
  	>
  	  I'm opened by c 
```

### Special paragraphs and branches

Paragraphs and branches can be triggered by a unique identifier, overriding the order of appearance. This breaks linearity and can be a great storytelling device.

To do so, create a special fragment link`[text](>unique-id)`where `text` is the link's text and `unique-id` is the unique identifier of the paragraph or branch you want to open. This paragraph or branch will, correspondingly named `>unique-id`.

**Note:** Unique identifiers can contains alphanumeric caracters, underscores and dashes.

##### Example: Special paragraphs and branches

```
>
  I have to ask you a [question].
    What do you think about [love](>i-fell-in-love)?

>i-fell-in-love
  I [fell] in love [once](>once).
    >
      It was a beautiful 
        >>once
		  English 
      girl.
```