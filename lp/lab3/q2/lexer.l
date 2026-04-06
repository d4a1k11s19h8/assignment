%{
#include "y.tab.h"
#include <string.h>
#include <stdlib.h>
%}

%%
"int"           { return INT; }
"float"         { return FLOAT; }
"if"            { return IF; }
"else"          { return ELSE; }
"while"         { return WHILE; }
[0-9]+\.[0-9]+  { yylval.str = strdup(yytext); return FNUM; }
[0-9]+          { yylval.str = strdup(yytext); return INUM; }
[a-zA-Z][a-zA-Z0-9]* { yylval.str = strdup(yytext); return ID; }
"=="|"!="|"<="|">="|"<"|">" { yylval.str = strdup(yytext); return RELOP; }
[ \t\n]         ; /* Skip whitespace and newlines */
.               { return yytext[0]; }
%%

int yywrap() { return 1; }
