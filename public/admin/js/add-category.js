
function validateAddCat(){
    var categoryName=document.getElementById('categoryName');
  var description=document.getElementById('description');

  if(categoryName.value===""){
    document.getElementById('addcategory').innerHTML="please enter correct category name";
    document.categoryForm.categoryName.focus();
    return false;
  }if(description.value===""){
    document.getElementById('addcategory').innerHTML="please fill the description";
    document.categoryForm.description.focus();
    return false;
  }else{
    return true;
  }
  }
