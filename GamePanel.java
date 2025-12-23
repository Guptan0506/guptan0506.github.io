// Java Swing basic game window
import javax.swing.*;
import java.awt.*;

public class GamePanel extends JPanel implements Runnable {
    private boolean running = true;

    public GamePanel() {
        new Thread(this).start();
    }

    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.setColor(Color.BLUE);
        g.fillRect(50, 50, 100, 100); // Example rectangle
    }

    public void run() {
        while(running) {
            repaint();
            try {
                Thread.sleep(16); // ~60 FPS
            } catch (InterruptedException e) { e.printStackTrace(); }
        }
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("My Java Game");
        GamePanel gp = new GamePanel();
        frame.add(gp);
        frame.setSize(800,600);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);
    }
}