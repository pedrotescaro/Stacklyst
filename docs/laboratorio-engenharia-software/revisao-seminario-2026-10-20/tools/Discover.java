public class Discover {
 public static void main(String[] args) throws Exception {
  for(String c: args){System.out.println("CLASS "+c); for(var m:Class.forName(c).getMethods())System.out.println(m);}
 }
}
