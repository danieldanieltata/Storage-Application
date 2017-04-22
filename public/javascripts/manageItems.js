$(document).ready(function(){
    
    // Handles the button clicks of the Items 
    $('.item-btn').click(function(){
        // Before that should send request to backend and get the item models from the DB
        console.log('/getItemModelsFromDB?itemTyp?itemType=' + this.id);
        //$.get('/getItemModelsFromDB?itemTyp?itemType=' + this.id) // handel this .

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


});