import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Random;

public class FlappyBirdClone extends JPanel implements ActionListener, KeyListener {
    // Window size
    private static final int WIDTH = 500;
    private static final int HEIGHT = 700;

    private Timer timer;
    private int birdY = HEIGHT / 2;
    private int birdX = WIDTH / 3;
    private int velocity = 0;
    private final int gravity = 1;
    private final int jumpStrength = -15;

    private ArrayList<Rectangle> pipes;
    private final int PIPE_WIDTH = 80;
    private final int GAP_HEIGHT = 200;
    private final int PIPE_SPEED = 5;
    private Random rand;

    private boolean gameOver = false;
    private int score = 0;

    public FlappyBirdClone() {
        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(Color.cyan);

        rand = new Random();
        pipes = new ArrayList<>();
        addPipe();

        timer = new Timer(20, this);
        timer.start();

        setFocusable(true);
        addKeyListener(this);
    }

    private void addPipe() {
        int height = 50 + rand.nextInt(300);
        // Top pipe
        pipes.add(new Rectangle(WIDTH, 0, PIPE_WIDTH, height));
        // Bottom pipe
        pipes.add(new Rectangle(WIDTH, height + GAP_HEIGHT, PIPE_WIDTH, HEIGHT - (height + GAP_HEIGHT)));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        // Draw bird
        g.setColor(Color.red);
        g.fillRect(birdX, birdY, 30, 30);

        // Draw pipes
        g.setColor(Color.green);
        for (Rectangle pipe : pipes) {
            g.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        }

        // Draw score
        g.setColor(Color.black);
        g.setFont(new Font("Arial", Font.BOLD, 32));
        g.drawString("Score: " + score, 20, 50);

        if (gameOver) {
            g.setFont(new Font("Arial", Font.BOLD, 64));
            g.drawString("GAME OVER", 50, HEIGHT / 2);
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (!gameOver) {
            // Bird movement
            velocity += gravity;
            birdY += velocity;

            // Pipes movement
            ArrayList<Rectangle> newPipes = new ArrayList<>();
            for (Rectangle pipe : pipes) {
                pipe.x -= PIPE_SPEED;
                if (pipe.x + pipe.width > 0) {
                    newPipes.add(pipe);
                } else {
                    score += 0.5; // Update score when pipe passes
                }
            }
            pipes = newPipes;

            // Add new pipe if needed
            if (pipes.size() < 4) {
                addPipe();
            }

            // Check collisions
            for (Rectangle pipe : pipes) {
                if (pipe.intersects(new Rectangle(birdX, birdY, 30, 30))) {
                    gameOver = true;
                    timer.stop();
                }
            }

            // Check boundaries
            if (birdY > HEIGHT || birdY < 0) {
                gameOver = true;
                timer.stop();
            }

            repaint();
        }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_SPACE && !gameOver) {
            velocity = jumpStrength;
        } else if (e.getKeyCode() == KeyEvent.VK_R && gameOver) {
            // Restart the game
            birdY = HEIGHT / 2;
            velocity = 0;
            pipes.clear();
            addPipe();
            score = 0;
            gameOver = false;
            timer.start();
        }
    }

    @Override
    public void keyReleased(KeyEvent e) { }
    @Override
    public void keyTyped(KeyEvent e) { }

    public static void main(String[] args) {
        JFrame frame = new JFrame("Flappy Bird Clone");
        FlappyBirdClone game = new FlappyBirdClone();
        frame.add(game);
        frame.pack();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setResizable(false);
        frame.setVisible(true);
    }
}      