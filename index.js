const modal = document.querySelector('.modal');
M.Modal.init(modal);

const form = document.querySelector('form');
const name = document.querySelector('#name');
const orders = document.querySelector('#orders');
const costPerItem = document.querySelector('#item-cost');
const error = document.querySelector("#error");

form.addEventListener('submit', (event) =>{
    event.preventDefault();
        let totalCost = parseInt(orders.value) * parseInt(costPerItem.value);
  
        const item = {
            cost:totalCost,
            name:name.value,
            orders:orders.value
        };
        
        db.collection('food').add(item);
        var instance = M.Modal.getInstance(modal);
        instance.close();
      
        form.reset(); 
})