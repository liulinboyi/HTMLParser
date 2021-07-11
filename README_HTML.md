```
tag-open ::= '<' tag-name ws* attr-list? ws* '>'
tag-empty ::= '<' tag-name ws* attr-list? ws* '/>'
tag-close ::= '</' tag-name ws* '>'


attr-list ::= (ws+ attr)*
attr ::= attr-empty | attr-unquoted | attr-single-quoted | attr-double-quoted

attr-empty ::= attr-name
attr-unquoted ::= attr-name ws* '=' ws* attr-unquoted-value
attr-single-quoted ::= attr-name ws* "=" ws* "'" attr-single-quoted-value "'"
attr-double-quoted ::= attr-name ws* "=" ws* '"' attr-double-quoted-value '"'

tag-name ::= alphabets (alphabets | digits)*                      // digits can not become first letter
attr-name ::= [^\s"'>/=[#x0000-#x001f]+ // [^\s"'>/=[\u0000-\u001f]+

// These three items should not contain 'ambiguous ampersand'...
attr-unquoted-value ::= [^\s"'=<>`]+
attr-single-quoted-value ::= [^']*
attr-double-quoted-value ::= [^"]*

alphabets ::= [a-zA-Z]
digits ::= [0-9]
ws ::= #x9 | #xA | #xD | #x20

```
