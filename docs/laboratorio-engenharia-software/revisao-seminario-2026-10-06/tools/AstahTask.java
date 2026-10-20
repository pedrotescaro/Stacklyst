import javax.script.*;
import java.nio.file.*;
import java.io.*;
import com.change_vision.jude.api.inf.AstahAPI;
public class AstahTask {
  public static void main(String[] args) throws Exception {
    var pa = AstahAPI.getAstahAPI().getProjectAccessor();
    try (var input = new FileInputStream(args[0])) { pa.open(input); }
    var engine = new ScriptEngineManager().getEngineByName("JavaScript");
    engine.put("astah", pa);
    engine.eval(Files.readString(Path.of(args[1])));
    pa.close();
    System.exit(0);
  }
}
