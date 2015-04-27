* Cannot currently start document with hidden paragraph

----------

ERROR:

>
  a [b]
    c
  d [e]
    f

SOLVED BY:

>
  a [b]
    c
  d [e](>e)
    >e
      f

-----