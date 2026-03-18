import java.awt.*;
import java.applet.*;

public class fontDemo extends Applet {
    String a, b, c;

    public void init() {
        setBackground(Color.black);
    }

    public void start() {
        a = "Applet is a client side application";
        b = "Java is a platform independent";
        c = "Welcome to the Applet program";
    }

    public void paint(Graphics g) {
        Font f1, f2, f3;
        Color c_obj;

        // First Font style
        f1 = new Font("Forte", Font.BOLD, 60);
        g.setFont(f1);
        c_obj = Color.red;
        g.setColor(c_obj);
        g.drawString(a, 100, 100);

        // Second Font style
        f2 = new Font("Rockwell", Font.ITALIC, 50);
        g.setFont(f2);
        c_obj = Color.white;
        g.setColor(c_obj);
        g.drawString(b, 100, 100);

        // Third Font style
        f3 = new Font("Lucida Calligraphy", Font.PLAIN, 30);
        g.setFont(f3);
        c_obj = Color.green;
        g.setColor(c_obj);
        g.drawString(c, 100, 200);
    }
}

<applet code="FontDemo.class"
  width=500 height=500>
</applet>
  
