# BetterContext Library

Example script tag:

```
<script 
  src="BetterContext.js" 
  data-bc-user="james@example.com"
  data-bc-api="1c4f5fd4-e7a9-4d2b-a4db-b6191e5fbe75">
</script>
```

* `data-bc-user` - the current better context user id
* `data-bc-api` - your better context api key

Auto mode example script:
```
<script 
  src="BetterContext.js" 
  data-bc-user="james@example.com"
  data-bc-auto
  data-bc-api="1c4f5fd4-e7a9-4d2b-a4db-b6191e5fbe75">
</script>

```

* `data-bc-auto` - enabled auto bootstrap of charts

# BetterContext auto chart elements

```
<div 
  data-bc-chart="pentagon" 
  data-bc-id="SOME_ID">
</div>
```

# Development

There are three scripts which can be used while working on the BetterContext
JavaScript code. 

* `script/setup` - installs all dependencies and builds the project
* `script/build` - builds the project
* `script/serve` - starts the development server

Scripts can be run from the root of the repo. For example to setup the project
you could run:

```
./scripts/setup
```



