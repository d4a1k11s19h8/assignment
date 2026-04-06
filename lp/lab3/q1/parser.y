%{
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void yyerror(char *s);
int yylex();

/* Helper function to format the prefix string */
char* create_prefix(char* op, char* left, char* right) {
    char* res = (char*)malloc(strlen(op) + strlen(left) + strlen(right) + 3);
    sprintf(res, "%s %s %s", op, left, right);
    return res;
}

char* create_unary(char* op, char* val) {
    char* res = (char*)malloc(strlen(op) + strlen(val) + 2);
    sprintf(res, "%s %s", op, val);
    return res;
}
%}

%union {
    char* str;
}

%token <str> NUMBER ID
%type <str> exp

/* Precedence rules: lowest to highest */
%left '+' '-'
%left '*' '/'
%right UMINUS

%%

input: exp { printf("Prefix Expression: %s\n", $1); }
     ;

exp: exp '+' exp    { $$ = create_prefix("+", $1, $3); }
   | exp '-' exp    { $$ = create_prefix("-", $1, $3); }
   | exp '*' exp    { $$ = create_prefix("*", $1, $3); }
   | exp '/' exp    { $$ = create_prefix("/", $1, $3); }
   | '-' exp %prec UMINUS { $$ = create_unary("-", $2); }
   | '(' exp ')'    { $$ = $2; }
   | NUMBER         { $$ = $1; }
   | ID             { $$ = $1; }
   ;

%%

void yyerror(char *s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main() {
    printf("Enter infix expression: ");
    yyparse();
    return 0;
}
