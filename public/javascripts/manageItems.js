$(document).ready(function(){
    
    // Handles the button clicks of the Items 
    $('.item-btn').click(function(){
        $.get('/getItemModelsFromDB?itemType=' + this.id, function(data){
            console.log(data);
        }); 

        $('#table-item-models>tbody>tr').remove();
        $('#table-item-models').append('<h3>This is section of ' + this.id);
    });

    // Handles the 'Add to table' thing .. when pressing the '+' button
    $('#add-item-to-table').click(function(){
        var newItem = $('<tr></tr>') ;
        var addTableItem = $('#table-item-models>thead>tr').last()
        for(let i = 0 ; i < addTableItem.last().children().length; i++){
            newItem.append('<td>-</td>');
        }

        $('#table-item-models>tbody').append(newItem);
    });

    // Handles the searching in the table 
    $('#searchInput').keyup(function(){
        var searchInput = $('#searchInput').val() ;
        var tableItems = $('#table-item-models>tbody>tr');
        
        for(let i = 0; i < tableItems.length; i++){
            if(!tableItems[i].innerText.includes(searchInput)){
                console.log(tableItems[i].parentNode);
                tableItems[i].classList.add('hide-table-item');
            }else{
                tableItems[i].classList.remove('hide-table-item');
            }
        }

    });

    // From here its the section that handles the Modal View('Add Item' section)

    // Handles the 'Add' button 
    $('#AddToModalTableField').click(function(){
        fieldNameInput = $('#tableFieldName').val();

        if(fieldNameInput.length == 0) return ;

        itemToAdd = '<p class="list-group-item">' + fieldNameInput + '<span class="removeFieldItemFromList pull-right glyphicon glyphicon-remove" aria-hidden="true"></span></p>'
        $('.tableFieldHolder').append(itemToAdd);

    });

    // Using this kind of listener because this object appends to the DOM after the page was loaded 
    // If adding elements dynamicly ... by code ... you have to use this listener 
    $('.tableFieldHolder').on('click', '.removeFieldItemFromList', function(){
        this.parentNode.remove();
    });

    // Remove all when colosing 
    $('.removeAllWhenClosingModal').click(function(){
        $('.tableFieldHolder>p').remove();
        $('#itemName').val('');
        $('#tableFieldName').val('');
    });


});