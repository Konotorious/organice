
// Not a JS file but the grammar for pegjs parser generator.

Expression "filter expression"
  = _* head:Term tail:(_+ Term)* _* {
      return tail.reduce((result, element) => {
        result.push(element[1]);
        return result;
      }, [head]);
    }

Term "filter term"
  = TermText
  / TermProp
  / TermTag

TermText "text filter term"
  = a:WordAlternatives {
        let type = 'ignore-case';
        // It's hard to check for upper-case chars in JS.
        // Best approach: https://stackoverflow.com/a/31415820/999007
        // Simplest approach for now:
        if (text().match(/[A-Z]/))
          type = 'case-sensitive';

        return {type: type, words: a}
  }

TermTag "tag filter term"
  = ":" a:TagAlternatives { return {type: 'tag', words: a} }

TermProp "property filter term"
  = ":" a:PropertyName ":" b:WordAlternatives? { return {key: a, value: b === null ? '' : b} };

WordAlternatives "alternatives"
  = head:Word tail:("|" Word)* {
       return tail.reduce((result, element) => {
         result.push(element[1]);
         return result;
       }, [head])
     }

TagAlternatives "tag alternatives"
  = head:TagName tail:("|" TagName)* {
       return tail.reduce((result, element) => {
         result.push(element[1]);
         return result;
       }, [head])
     }

Word "word"
  = [^: \t|]+ { return text() }

// https://orgmode.org/manual/Property-Syntax.html
// - Property names (keys) are case-insetive
// - Property names must not contain space
PropertyName "property name"
  = [^: \t]+ { return text() }

// https://orgmode.org/manual/Tags.html
TagName "tag name"
  = [a-zA-Z0-9_@]+ { return text() }

_ "whitespace"
  = [ \t]