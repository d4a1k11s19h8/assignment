%{
#include <stdio.h>
#include <ctype.h>
%}

%%
"auto"|"break"|"case"|"char"|"const"|"continue"|"default"|"do"|"double"|"else"|"enum"|"extern"|"float"|"for"|"goto"|"if"|"int"|"long"|"register"|"return"|"short"|"signed"|"sizeof"|"static"|"struct"|"switch"|"typedef"|"union"|"unsigned"|"void"|"volatile"|"while"   { ECHO; /* Do not capitalize keywords */ }

[a-zA-Z_][a-zA-Z0-9_]* { 
    // This matches identifiers
    yytext[0] = toupper(yytext[0]);
    printf("%s", yytext); 
}

.|\n    { ECHO; }
%%

int main() {
    yylex();
    return 0;
}
