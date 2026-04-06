import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.*;

public class TestParser {
    public static void main(String[] args) throws Exception {
        // Test cases including edge cases
        String[] testExpressions = {
            "10 + 20 * 3",       // Standard precedence
            "(10 + 20) * 3",     // Parentheses
            "-5 + 15 / -3",      // Unary minus
            "100 / 0",           // Division by zero (Parser shouldn't crash, it just parses syntax)
            "42 + * 7",          // Syntax Error
            "123 abc 456"        // Lexer Error (Invalid characters)
        };

        for (String expr : testExpressions) {
            System.out.println("\nTesting Expression: " + expr);
            parseExpression(expr);
        }
    }

    private static void parseExpression(String inputString) {
        CharStream input = CharStreams.fromString(inputString);
        ArithmeticLexer lexer = new ArithmeticLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        ArithmeticParser parser = new ArithmeticParser(tokens);

        // Remove default error listeners and add a strict one to catch syntax issues
        parser.removeErrorListeners();
        parser.addErrorListener(new BaseErrorListener() {
            @Override
            public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, 
                                    int line, int charPositionInLine, String msg, RecognitionException e) {
                System.err.println("  [Syntax Error] line " + line + ":" + charPositionInLine + " " + msg);
            }
        });

        // Start parsing at the 'expr' rule
        ParseTree tree = parser.start();
        
        // If there are no syntax errors, print the LISP-style tree
        if (parser.getNumberOfSyntaxErrors() == 0) {
            System.out.println("  [Success] Parse Tree: " + tree.toStringTree(parser));
        }
    }
}
