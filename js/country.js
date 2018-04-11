class List {
    constructor(elem, data){
        this.elem = elem;
        this.data = data;  
    }
    render(arr){
        this.removeList();        
        let items = arr || this.data.items,
            h2    = document.createElement('h2'),
            list  = document.createElement('ul');
        
            h2.textContent = this.data.title || 'title is empty';
            list.classList.add('list-general');
            
        if (this.data.defaultEvent) 
                list.addEventListener('click', (event)=>
                {                
                    this.selected = event.target.textContent;                
                    list.dispatchEvent(this.data.defaultEvent);
                })
       
        if (items.length == 0){
            items.push(['No matches'])
        }

        items.forEach((item)=> {
            let a  = document.createElement('a'),
                li = document.createElement('li');
            
            li.textContent = item;
            a.appendChild(li)     
            list.appendChild(a);
        })
        this.elem.prepend(h2);
        this.elem.appendChild(list);        
    }    
    removeList(){
        this.elem.textContent = '';
    }
    addItem(item){
        this.data.items.push(item);
    }    
    filterItems(option){
        let val = option.criterion.value,
            arr = [];     
            arr = (this.data.items.filter((a) => 
            {
                return !(a.toLowerCase().indexOf(val.toLowerCase()) !== 0);
            }))        
        this.render(arr);
    }
}
