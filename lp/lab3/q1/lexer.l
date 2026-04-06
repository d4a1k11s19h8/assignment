%{
#include <string.h>
#include "parser.tab.h"
%}

%%
[0-9]+          { yylval.str = strdup(yytext); return NUMBER; }
[a-zA-Z][a-zA-Z0-9]* { yylval.str = strdup(yytext); return ID; }
[ \t]           ; /* Skip whitespace */
\n              { return 0; }
.               { return yytext[0]; }
%%

int yywrap() {
    return 1;
}
