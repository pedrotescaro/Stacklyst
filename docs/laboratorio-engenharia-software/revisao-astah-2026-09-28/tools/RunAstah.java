import javax.script.*;
import java.nio.file.*;
import com.change_vision.jude.api.inf.AstahAPI;
public class RunAstah {
 public static void main(String[] args) throws Exception {
  var manager=new ScriptEngineManager();
  for(var f:manager.getEngineFactories())System.out.println(f.getEngineName()+" "+f.getNames());
  if(args.length==0)return;
  var pa=AstahAPI.getAstahAPI().getProjectAccessor();
  pa.create();
  var engine=manager.getEngineByName("JavaScript");
  engine.put("astah",pa);
  engine.eval(Files.readString(Path.of(args[0])));
  pa.close();
  System.exit(0);
 }
}
