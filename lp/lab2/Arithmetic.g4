grammar Arithmetic;

// --- PARSER RULES (Strict LL(1) structure) ---

// NEW: Add this top-level rule
start : expr EOF ;

// (The rest remains exactly the same)
expr  : term exprP ;

exprP : '+' term exprP
      | '-' term exprP
      | 
      ;

term  : factor termP ;

termP : '*' factor termP
      | '/' factor termP
      | 
      ;

factor: INT
      | '(' expr ')'
      | '-' factor
      ;

// --- LEXER RULES ---
INT   : [0-9]+ ;
WS    : [ \t\r\n]+ -> skip ;
ERR   : . ;
