%{
#include <stdio.h>
%}

%%

DO/([ \t]*[0-9]+[ \t]*[a-zA-Z0-9]+[ \t]*=[ \t]*[0-9]+[ \t]*,) {
    printf("Found Keyword: DO\n");
}

[a-zA-Z][a-zA-Z0-9]* { printf("Found Identifier: %s\n", yytext); }

.|\n    { ECHO; }

%%

int main() {
    yylex();
    return 0;
}
