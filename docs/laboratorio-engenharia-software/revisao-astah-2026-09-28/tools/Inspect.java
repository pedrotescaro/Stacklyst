public class Inspect {
 public static void main(String[] a) throws Exception {
  for(String n:a){Class<?> c=Class.forName("com.change_vision.jude.api.inf."+n);System.out.println(n);for(var f:c.getFields())System.out.println(f.getName()+"="+f.get(null));for(var m:c.getDeclaredMethods())System.out.println(m);}
 }
}
