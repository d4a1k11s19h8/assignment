%{
#include <stdio.h>
%}

/* Define a state for multi-line comments */
%x BLOCK_COMMENT

%%
"//".* { /* Ignore single line comment */ }
"/*"            { BEGIN(BLOCK_COMMENT); }
<BLOCK_COMMENT>"*/" { BEGIN(INITIAL); }
<BLOCK_COMMENT>.|\n { /* Ignore content inside block comment */ }
.|\n            { ECHO; }
%%

int main() {
    yylex();
    return 0;
}
