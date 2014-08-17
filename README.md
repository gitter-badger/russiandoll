# Russiandoll

Russiandoll is a **plain text formatting syntax that delivers literary content in interactive, foldable pieces of sentence**, inspired by [Alan Trotter](https://twitter.com/alantrotter)'s [website](http://greaterthanorequalto.net/). It also borrows the design philosophy of [Markdown](http://daringfireball.net/projects/markdown/), i.e. making a complex structure easily readable in plain text, as well as some of its syntactic elements.

We're used to saying “an image is worth a thousand words”, but in this case, it's: “a sentence is worth a thousand more”.

Russiandoll is currently **PRE-ALPHA** and is nowhere from usable, as it lacks basic functionality, but stay tuned for an official beta!

## Syntax

Russiandoll is built around paragraphs that contain links and branches. The branches are hidden until 

Russiandoll is [indentation-based](https://en.wikipedia.org/wiki/Off-side_rule), which means that the level of indentation specifies the scope of the declarations. Like most indentation-based languages, it doesn't matter whether you use spaces or tabs to indent your declarations. 

### Paragraphs

Russiandoll is structured around blocks. Because it has literary purposes, the first level of intentation should always be a new paragraph indicator `>`. Any `>` nested in a paragraph will be considered as a branch.

##### Example 1

```
>
  New paragraph text.
```

You can also write your text on multiple lines. As long as it's on the same indentation level, it will be collapsed into a single line. Just be sure to add spaces at the end of a line if you want to separate it from the next one.

##### Example 2

```
>
  New 
  paragraph 
  text 
  .
```

### Nested fragments

The magic of Russiandoll lies in the collapsed, nested parts of a sentence that only unfold when clicking on special words. To create a nested sentence, just wrap a word (or several) in brackets `[text]` (where `text` is the link's content), then start a new block at one deeper level. Clicking this link will reveal this new block, just next to it.


##### Example

```
>
  This new paragraph is pretty [short].
    But coupled with this hidden sentence it isn't!
```

### Multiple nested fragments

Sometimes you'll want several fragment links in the same sentence. In this case, just create extra blocks `>`. In this case, `>` is not a paragraph indicator, but a *nested fragment branch*.

##### Example

```
>
  I remember when [you] dressed up like a big [orange].
    >
      It was a night to remember.
    >
      We got trouble with the police.
```

### Hidden paragraphs

You can also have fragment links open new paragraphs. Just add `(>paragraph-name)` after your link's brackets, where `paragraph-name` is the unique identifier of the paragraph you want to open.

##### Example

```
>
  I have to ask you a question.
    What do you [think] about [love](>i-fell-in-love)?
      Answer honestly.

>i-fell-in-love
  I fell in love once.
```

## Elements

### Block

Type 				| Symbol
-					| -
Paragraph 			| `>`
Hidden Paragraph 	| `>paragraph-name`, where `paragraph-name` is a safe string

### Inline

Type 				| Symbol
-					| -
Hidden Fragment 	| `n:`, where `n` is an integer
Fragment link 		| `[text]`, where `text` is rich text
Paragraph link 		| `[text](>paragraph-name)`