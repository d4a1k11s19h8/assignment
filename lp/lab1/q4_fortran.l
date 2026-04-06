%{
#include <stdio.h>
%}

%%
/* r1/r2 Logic:
   r1 = DO
   r2 = pattern matching: space + number + space + identifier + space + = + space + number + space + comma
*/
DO/([ ]*[0-9]+[ ]*[a-zA-Z0-9]+[ ]*=[ ]*[0-9]+[ ]*,) {
    printf("Found Keyword: DO\n");
}

[a-zA-Z][a-zA-Z0-9]* { printf("Found Identifier: %s\n", yytext); }
.|\n                 { ECHO; }
%%

int main() {
    yylex();
    return 0;
}
