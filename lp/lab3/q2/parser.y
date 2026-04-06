%{
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void yyerror(char *s);
int yylex();

int temp_count = 0;
int label_count = 0;

char* new_temp() {
    char* s = malloc(10);
    sprintf(s, "t%d", temp_count++);
    return s;
}

char* new_label() {
    char* s = malloc(10);
    sprintf(s, "L%d", label_count++);
    return s;
}

struct sym { char name[20]; int type; } sym_tab[20];
int sym_ptr = 0;

int get_type(char* name) {
    for(int i=0; i<sym_ptr; i++) 
        if(strcmp(sym_tab[i].name, name) == 0) return sym_tab[i].type;
    return -1;
}
%}

%union {
    char* str;
    struct { char* code; char* addr; int type; } expr;
}

%token <str> ID INUM FNUM RELOP IF ELSE WHILE INT FLOAT
%type <expr> exp assignment 
%type <str> stmt stmt_list condition declaration declaration_list

%right '='
%left '+' '-'
%left '*' '/'

%%

/* High level: Declarations first, then statements */
prog: declaration_list stmt_list { printf("%s%s", $1, $2); }
    ;

declaration_list: declaration_list declaration {
                    char* res = malloc(strlen($1) + strlen($2) + 1);
                    sprintf(res, "%s%s", $1, $2); $$ = res;
                }
                | { $$ = ""; }
                ;

declaration: INT ID ';' { sym_tab[sym_ptr].type = 0; strcpy(sym_tab[sym_ptr++].name, $2); $$ = ""; }
           | FLOAT ID ';' { sym_tab[sym_ptr].type = 1; strcpy(sym_tab[sym_ptr++].name, $2); $$ = ""; }
           ;

stmt_list: stmt_list stmt { 
            char* res = malloc(strlen($1) + strlen($2) + 1);
            sprintf(res, "%s%s", $1, $2); $$ = res; 
         }
         | { $$ = ""; }
         ;

stmt: assignment ';' { $$ = $1.code; }
    | IF '(' condition ')' '{' stmt_list '}' ELSE '{' stmt_list '}' {
        char *l1 = new_label(), *l2 = new_label();
        char *res = malloc(strlen($3) + strlen($6) + strlen($10) + 100);
        sprintf(res, "if !(%s) goto %s\n%sgoto %s\n%s:\n%s%s:\n", $3, l1, $6, l2, l1, $10, l2);
        $$ = res;
    }
    | WHILE '(' condition ')' '{' stmt_list '}' {
        char *l1 = new_label(), *l2 = new_label();
        char *res = malloc(strlen($3) + strlen($6) + 100);
        sprintf(res, "%s:\nif !(%s) goto %s\n%sgoto %s\n%s:\n", l1, $3, l2, $6, l1, l2);
        $$ = res;
    }
    ;

assignment: ID '=' exp {
    char* res = malloc(strlen($3.code) + 100);
    int dest_type = get_type($1);
    if(dest_type == 1 && $3.type == 0) {
        char* t = new_temp();
        sprintf(res, "%s%s = (float)%s\n%s = %s\n", $3.code, t, $3.addr, $1, t);
    } else {
        sprintf(res, "%s%s = %s\n", $3.code, $1, $3.addr);
    }
    $$.code = res;
}
;

exp: exp '+' exp {
    $$.addr = new_temp();
    $$.type = ($1.type || $3.type);
    char* res = malloc(strlen($1.code) + strlen($3.code) + 100);
    sprintf(res, "%s%s%s = %s + %s\n", $1.code, $3.code, $$.addr, $1.addr, $3.addr);
    $$.code = res;
}
| exp '-' exp {
    $$.addr = new_temp();
    $$.type = ($1.type || $3.type);
    char* res = malloc(strlen($1.code) + strlen($3.code) + 100);
    sprintf(res, "%s%s%s = %s - %s\n", $1.code, $3.code, $$.addr, $1.addr, $3.addr);
    $$.code = res;
}
| exp '*' exp {
    $$.addr = new_temp();
    $$.type = ($1.type || $3.type);
    char* res = malloc(strlen($1.code) + strlen($3.code) + 100);
    sprintf(res, "%s%s%s = %s * %s\n", $1.code, $3.code, $$.addr, $1.addr, $3.addr);
    $$.code = res;
}
| exp '/' exp {
    $$.addr = new_temp();
    $$.type = ($1.type || $3.type);
    char* res = malloc(strlen($1.code) + strlen($3.code) + 100);
    sprintf(res, "%s%s%s = %s / %s\n", $1.code, $3.code, $$.addr, $1.addr, $3.addr);
    $$.code = res;
}
| ID { $$.addr = strdup($1); $$.type = get_type($1); $$.code = ""; }
| INUM { $$.addr = strdup($1); $$.type = 0; $$.code = ""; }
| FNUM { $$.addr = strdup($1); $$.type = 1; $$.code = ""; }
| '(' exp ')' { $$ = $2; }

condition: exp RELOP exp {
    char* res = malloc(100);
    sprintf(res, "%s %s %s", $1.addr, $2, $3.addr);
    $$ = res;
}
;

%%

void yyerror(char *s) { fprintf(stderr, "Parse Error: %s\n", s); }
int main() { yyparse(); return 0; }
