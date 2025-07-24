function myFun(event){
    event.preventDefault();
    var form = document.forms.elementForm;
     console.log(form.elements)
    var elementName = form.elements.element.value;
    var text = form.elements.text.value;
    var tag = document.createElement(elementName);
    tag.innerHTML = text;
    var result = document.getElementById("result");
    result.append(tag);

}
function myFun(event) {
    event.preventDefault();
    var form = document.forms.elementForm;
    console.log(form.elements);
    
    var elementName = form.elements.element.value;
    var text = form.elements.text.value; // Corrected typo: "elemetns" to "elements"
    
    var tag = document.createElement(elementName);
    tag.innerHTML = text;
    
    var result = document.getElementById("result");
    result.appendChild(tag); // Changed "append" to "appendChild"
 }
