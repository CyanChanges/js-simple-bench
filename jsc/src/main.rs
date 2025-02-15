use javascriptcore::*;
use std::io::{self, Read};
use std::string::String;

fn main() {
    let mut string = String::new();

    let ctx = JSContext::default();
    io::stdin()
        .lock()
        .read_to_string(&mut string)
        .expect("failed to read from stdin");
    let r = evaluate_script(&ctx, string, None, "<main>", 1).expect("failed to evaluate script");
    println!("{}", r.as_string().unwrap());
}
