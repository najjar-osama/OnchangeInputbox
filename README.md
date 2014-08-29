# OnChange InputBox/TextArea

This widget creates an inputbox or textarea that lets you run a microflow everytime a user changes the content, one key press at a time. It features a delay and a minimum character treshold to prevent excessive microflow calls.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

### Properties

#### Inputbox
Attribute: The attribute that is linked to the inputbox.
On change microflow: The microflow that is triggered with each change in the inputbox.
On leave microflow: *Optional* - The microflow that is triggered when the inputbox loses focus.
Delay: *Optional* - The delay in milliseconds before the onchange microflow is triggered.
Character Treshold: *Optional* - The minimum amount of characters required for the onchange microflow to be triggered.

#### Textarea
Attribute: The attribute that is linked to the inputbox.
On change microflow: The microflow that is triggered with each change in the inputbox.
Delay: *Optional* - The delay in milliseconds before the onchange microflow is triggered.
Character Treshold: *Optional* - The minimum amount of characters required for the onchange microflow to be triggered.

The attributes under *General* are exactly the same as those for a normal TextArea.