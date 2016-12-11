(function ($) {

	var products = [
	    { id:"1", name: "Товар 1", price: "8050" },
	    { id:"2", name: "Товар 2", price: "3000" },	    
	    { id:"3", name: "Товар 3", price: "3200" },
	   	{ id:"4", name: "Товар 4", price: "4320" },
        { id:"5", name: "Товар 5", price: "1200" },     
        { id:"6", name: "Товар 6", price: "7500" },
        { id:"7", name: "Товар 7", price: "3400" },    
	];

	var Product = Backbone.Model.extend({	
	});

    var Shop = Backbone.Collection.extend({
        model: Product
    });

    var bascetProduct = Backbone.Model.extend({
        defaults: {
            count: 1
        }       
    });

    var Bascet = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("bascet-collection"),
        model: bascetProduct
    });

    var Bascet_to_server = Backbone.Collection.extend({
        model: bascetProduct,
        url: "/test"  
    }); 

    var bascet_collection = new Bascet();
    var bascet_to_server = new Bascet_to_server();

    var ProductView = Backbone.View.extend({
        tagName: "article",
        className: "product-container",
        template: $("#storeTemplate").html(),

        render: function () {
            var tmpl = _.template(this.template);
            
            $(this.el).html(tmpl(this.model.toJSON()));
            return this;
        },

        events:{
            "click .add_to_bascet":"addToBascet",
            "click .less":"countDown",
            "click .more":"countUp"
        },
        
        addToBascet: function(){
            var product_temp = this.model.toJSON();
            
            product_temp.count = $(this.el).find("input").val();

            bascet_collection.forEach(function(model){
                
                if (model.get('id') == product_temp.id){
                    model.set('count', parseInt(model.get('count')) + parseInt(product_temp.count)); 
                    model.save();  

                    var change_to_server = bascet_to_server.get(product_temp.id);
                    change_to_server.save();
                }
            });

            bascet_collection.add(product_temp);
            var send = bascet_collection.at(bascet_collection.length-1);
            send.save();

            alert("Товар добавлен в корзину");

            bascet_to_server.add(product_temp);
            var send_to_server = bascet_to_server.at(bascet_to_server.length-1);
            send_to_server.save();
        },

        countDown: function(){
            var count = $(this.el).find("input").val();
            if (+count >= 2){
                $(this.el).find("input").val(count-1);
            }
        },

        countUp: function(){
            var count = $(this.el).find("input").val();
            $(this.el).find("input").val(+count+1);
        }


    });   

    var StoreView = Backbone.View.extend({
        el: $("#store"),

       initialize: function () {
            this.collection = new Shop(products);
            this.render();
        },

        render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderProduct(item);
            }, this);
        },

        renderProduct: function (item) {
            var productView = new ProductView({
                model: item
            });
            this.$el.append(productView.render().el);
        },

        events:{
            "click #open-bascet": "openBascet"
        },

        openBascet: function () {
            controller.navigate("bascet",{trigger: true});
        }
    });



    var bascetProductView = Backbone.View.extend({
        tagName: "article",
        className: "product-container",
        template: $("#bascetTemplate").html(),

        initialize: function () {
            this.model.on("change", this.render, this);
        },

        render: function () {
            var tmpl = _.template(this.template);
            
            $(this.el).html(tmpl(this.model.toJSON()));
            return this;
        },

        events:{
            "click .del_from_bascet":"delFromBascet",
            "change .count":"changeCount",
            "click .less":"countDown",
            "click .more":"countUp"
        },

        changeCount:function(){
            this.model.set('count',$(this.el).find("input").val());
            this.model.save();
            
            var send_to_server = bascet_to_server.get(this.model.id);
            send_to_server.save();
        },
        
        delFromBascet: function(){
            this.model.destroy();
            this.remove();

            var send_to_server = bascet_to_server.get(this.model.id);
            send_to_server.destroy();
        },

        countDown: function(){
            var count = $(this.el).find("input").val();
            if (+count >= 2){
                $(this.el).find("input").val(count-1);
            }

            this.model.set('count',$(this.el).find("input").val());
            this.model.save();
            
            var send_to_server = bascet_to_server.get(this.model.id);
            send_to_server.save();
        },

        countUp: function(){
            var count = $(this.el).find("input").val();
            $(this.el).find("input").val(+count+1);

            this.model.set('count',$(this.el).find("input").val());
            this.model.save();
            
            var send_to_server = bascet_to_server.get(this.model.id);
            send_to_server.save();
        }

    }); 

    var BascetView = Backbone.View.extend({
        el: $("#bascet"),

        initialize: function () {
            bascet_collection.fetch();

            bascet_to_server.set(bascet_collection.toJSON());
            
            this.collection = bascet_collection;
            this.collection.on("add", this.renderbascetProduct, this);
            
            this.render();
        },

        render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderbascetProduct(item);
            }, this);
        },

        renderbascetProduct: function (item) {
            var bascetView = new bascetProductView({
                model: item
            });
            this.$el.append(bascetView.render().el);
        },

        events:{
            "click #close-bascet": "closeBascet"
        },


        closeBascet: function () {
            controller.navigate("",{trigger: true});
        }
    });

    var Controller = Backbone.Router.extend({
        routes: {
            "": "store",
            "bascet": "bascet"
        },

        store: function () {
            $("#bascet").hide(); 
        },

        bascet: function () {
            $("#bascet").show();
        }

    });

    var store = new StoreView();
    var bascet = new BascetView();

    var controller = new Controller();

    Backbone.history.start(); 

} (jQuery));
