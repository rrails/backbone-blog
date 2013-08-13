$(document).ready(function(){ //wait until document is ready. we are waiting for dom
//dictionary of  templates
//this has the html code
  var templates = {
    appView: '<h1>Recent Posts</h1><ul id="posts"></ul>',
    blogList: '<a href="#posts/{{ slug }}">{{ title }}</a>',
    blogView:'<div class="post"><h1 class="title">{{ title }}</h1><h3 class="slug">{{ slug }} </h3><div class="content">{{{ content }}}</div></div>'
  };

// our only model
  var Post = Backbone.Model.extend({
    // usse slug instead of id to refer to these objects

    idAttribute: 'slug',
    defaults: {
      title: 'New post',
      slug: 'new-post',
      content: 'content'
    }
  });

//what type of collection goes in here.
  var Posts = Backbone.Collection.extend({

    model: Post
  });

// our blog list template just had title. when we create a view we create the li's. this is inside a ul.
//the views in backbone allow you to do a lot more logic then the views we are use to in ruby
  var PostListView = Backbone.View.extend({
    tagName: 'li',
// click event call view
    events: {
      'click': 'view'
    },
// if you need clike how tall is the screen etc not used for this
    initialize: function(){

    },
// compile template and render it and return this.
// stick this new list ite, in the page
    render: function(){
      var template = Handlebars.compile(templates.blogList);
      this.$el.html( template(this.model.toJSON()));
      // returning this lets us chain our code
      return this;
    },

    //event handler for the click event
    view: function(){
      // navigate to the post view route (/posts/post-slug)
      app.navigate('posts/' + this.model.get('slug'), true);
      return false;
    }
  });

  //view for a single post
  var PostView = Backbone.View.extend({
    el: '#main', //where this is going to end up on this page.
    initialize: function(){
      // weird - we are rendering from the initialize(). probably don't this.
      // if we want to re-render then this wouldn't work as this reinitializes.
      var template = Handlebars.compile(templates.blogView);
      this.$el.html( template(this.model.toJSON() ));

    }
  });

// view for the entire app

  var AppView = Backbone.View.extend({
    el: '#main', // where this is going to end up on the page
    initialize: function(){
    this.$el.html( templates.appView); //not using handlebars so no need to compile
    this.list = $('#posts'); //caching the #posts for later use
    },

    render: function(){
      this.collection.each(function(post){
        var view = new PostListView({model: post}); //new view for each post
        //bung it on the end of the list. we could have done this in 2 stage
        this.list.append(view.render().el);
      }, this); //pass in this as the scope of our each()
      return this; // allow chaining again
    }
  });

//these routes happen in the browser not in the server.
  var AppRouter = Backbone.Router.extend({
    // only 2 routes
    routes: {
      '': 'index',
      'posts/:slug': 'getPost'
    },
    initialize: function(options){
      this.options = options;
      //test collection data with 4 posts
      this.posts = new Posts([
        new Post({title: 't1', slug: 't1', content: 'Test one'}),
        new Post({title: 't2', slug: 't2', content: 'Test two'}),
        new Post({title: 't3', slug: 't3', content: 'Test three'}),
        new Post({title: 't4', slug: 't4', content: 'Test four'})
      ]);
    },
    // init the app and show the list of blog posts
    index: function(){
      var appView = new AppView({ collection: this.posts});
      appView.render();
    },
    //show a specified post.
    getPost: function(slug){
      var post = this.posts.get(slug);
      new PostView({model: post}); //we are rendering this in the initialise and therefore we dont have to keep the id
    }
  });
  var app = new AppRouter();
  Backbone.history.start();
  // Backbone.history.start({pushState: true});

  Backbone.history.on('route', function() {
    var fragment = Backbone.history.getFragment();
    console.log('The user navigated to', fragment);
  });

});