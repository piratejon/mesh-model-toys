
/***
Based on "How to create a GUID / UUID in Javascript?" <http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript> accessed 16 March 2013 at 22:07 CDT
Question by: StackOverflow user "Jason Cohen" <http://stackoverflow.com/users/4926/jason-cohen>
Answer by: StackOverflow user "broofa" <http://stackoverflow.com/a/2117523>
Attributed in accordance with <http://stackoverflow.com/questions/4530182/using-code-from-this-site> as accessed 14 March 2013 at 00:13 CDT
  ***/

function guid() {
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

