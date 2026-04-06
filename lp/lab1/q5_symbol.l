%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 100

// Symbol Table Entry Structure
struct Entry {
    char *name;
    char *type;
    struct Entry *next;
};

struct Entry *symbol_table[TABLE_SIZE];

// Hash Function
unsigned int hash(char *str) {
    unsigned int hash = 0;
    while (*str) hash = (hash << 5) + *str++;
    return hash % TABLE_SIZE;
}

// Insert Function
void install(char *name, char *type) {
    unsigned int h = hash(name);
    struct Entry *p = symbol_table[h];
    
    // Check if already exists
    while (p != NULL) {
        if (strcmp(p->name, name) == 0) return; // Already exists
        p = p->next;
    }

    // Insert new entry at head of list
    struct Entry *new_node = (struct Entry *)malloc(sizeof(struct Entry));
    new_node->name = strdup(name);
    new_node->type = strdup(type);
    new_node->next = symbol_table[h];
    symbol_table[h] = new_node;
}

// Print Table Function
void print_table() {
    printf("\n\n--- Symbol Table ---\n");
    printf("Index\tName\tType\n");
    for (int i = 0; i < TABLE_SIZE; i++) {
        if (symbol_table[i] != NULL) {
            struct Entry *p = symbol_table[i];
            while (p != NULL) {
                printf("%d\t%s\t%s\n", i, p->name, p->type);
                p = p->next;
            }
        }
    }
}
%}

%%
"int"|"float"|"char"|"void"  { /* Ignore types for now */ }
[0-9]+                       { /* Ignore numbers */ }
[a-zA-Z_][a-zA-Z0-9_]* { install(yytext, "ID"); }
.|\n                         { /* Ignore others */ }
%%

int main() {
    // Initialize table
    for(int i=0; i<TABLE_SIZE; i++) symbol_table[i] = NULL;
    
    yylex();
    print_table();
    return 0;
}
