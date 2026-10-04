// Each tuple is an editable CMS project step: title, explanation, result, code, language.
// Screenshots are intentionally left empty for the administrator's real captures.
export const walkthroughs = {
 'hello-world-flow': {
  minutes:10, flow:['Inject','Debug'], requirements:['A running Node-RED editor'],
  build:'A button that sends your first message into the Debug sidebar.',
  result:'Each click of Inject produces one Hello Node-RED string in Debug.',
  troubleshooting:'If no message appears, check the wire, deploy your changes, enable the Debug node and clear any sidebar filters.',
  steps:[
   ['Place two nodes','Drag Inject and Debug onto a blank flow tab. Put Inject on the left.','Two nodes appear in the workspace.'],
   ['Write the message','Open Inject. Change the payload type to string and enter Hello Node-RED. Click Done.','Inject is configured with a text payload rather than a timestamp.'],
   ['Connect and deploy','Drag a wire from the right port of Inject to the left port of Debug. Press Deploy.','The nodes are connected and their pending-change markers disappear.'],
   ['Read your first result','Open the Debug sidebar and press the Inject button once. Expand the entry to inspect its type.','Debug shows Hello Node-RED with type string.']
  ]
 },
 'simple-calculator': {
  minutes:20,flow:['Inject JSON','Function: add','Debug'],requirements:['The first-flow lesson','Basic understanding of JSON objects'],
  build:'A flow that adds two numbers and rejects invalid input.',result:'The input {a:8,b:4} produces 12. Invalid operands produce a warning rather than an incorrect sum.',
  troubleshooting:'Use JSON payload type. A quoted "8" is text, not a number. Check that the Function returns msg after assigning the result.',
  steps:[
   ['Supply two numbers','Add Inject and choose JSON as the payload type. Enter this object.','The complete message contains a numeric a and b inside payload.','{"a":8,"b":4}','json'],
   ['Calculate the sum','Wire Inject to a Function node and paste the code. It validates both operands before adding.','Valid numbers are added without changing the rest of the message.','const { a, b } = msg.payload || {};\nif (typeof a !== "number" || typeof b !== "number" || !Number.isFinite(a) || !Number.isFinite(b)) {\n  node.warn("Supply two finite numbers");\n  return null;\n}\nmsg.payload = a + b;\nreturn msg;','javascript'],
   ['Inspect the answer','Connect Function to Debug, deploy and inject.','Debug displays the number 12.'],
   ['Test a failure','Change b to the string four and inject again. Then restore a valid number.','The invalid message is stopped and the valid message still works.']
  ]
 },
 'temperature-monitor': {
  minutes:25,flow:['Inject: temperature','Switch: > 30','Debug: high / normal'],requirements:['Inject, Switch and Debug node guides'],
  build:'A two-branch flow that separates high temperatures from normal readings.',result:'A reading of 31 reaches High; 29 and 30 reach Normal.',
  troubleshooting:'Compare msg.payload as a number. Make the second Switch rule otherwise, and use different Debug labels to distinguish the outputs.',
  steps:[
   ['Simulate a sensor','Add three Inject nodes with numeric payloads 29, 30 and 31. Name them after their values.','You have repeatable test readings without needing a sensor.'],
   ['Set the threshold','Wire each Inject to one Switch. Select msg.payload. Add a greater-than rule with number 30 and an otherwise rule.','The Switch has two output ports.'],
   ['Name the results','Connect the first output to a Debug named High and the second to a Debug named Normal. Deploy.','Every branch has an observable result.'],
   ['Test the boundary','Click each Inject once and compare its output label.','29 and 30 go to Normal; 31 goes to High.']
  ]
 },
 'mqtt-sensor-monitor': {
  minutes:30,flow:['Inject JSON','MQTT Out','Your broker','MQTT In','JSON','Debug'],requirements:['A private MQTT broker and its connection details','MQTT In and MQTT Out node guides'],
  build:'A simulated sensor that publishes a reading and receives it through a broker.',result:'A temperature reading crosses the broker and appears as a parsed object in Debug.',
  troubleshooting:'Check both nodes use the same broker and the exact topic lab/room1/temperature. A disconnected status means delivery is not yet working. Match text versus parsed-JSON output settings.',
  steps:[
   ['Create the reading','Set Inject payload type to JSON and enter the reading below.','The message contains a number and an explicit unit.','{"temperature":28,"unit":"C"}','json'],
   ['Publish the reading','Connect Inject to MQTT Out. Select your broker configuration and topic lab/room1/temperature. Leave retain off for this test.','MQTT Out uses your intended broker and test topic.'],
   ['Subscribe to the topic','Add MQTT In with the same broker and topic. Choose string output, wire it to a JSON node, then Debug.','The subscriber converts JSON text into an object.'],
   ['Deploy and inspect','Deploy, wait for both MQTT nodes to show connected, then click Inject.','Debug shows an object with temperature 28 and unit C.'],
   ['Change the reading','Change the temperature to 29, deploy and inject again.','A new message arrives with 29; the earlier entry remains available for comparison.']
  ]
 },
 'raspberry-pi-led-controller': {
  minutes:40,flow:['Inject: 1 / 0','Switch: allow only 0 or 1','Debug or verified GPIO output'],requirements:['A Raspberry Pi with a verified compatible GPIO integration','LED and current-limiting resistor','A board pinout checked by your instructor'],
  build:'An on/off control flow, first verified in simulation and then connected to a supervised low-voltage LED circuit.',result:'Simulation produces only 0 and 1. After checking the hardware integration, the LED follows those commands.',
  troubleshooting:'Check physical pin versus BCM numbering, resistor, LED polarity and package support for the exact Pi model. A correct Debug result with no LED change indicates a hardware/integration issue.',
  steps:[
   ['Create safe commands','Add two Inject nodes with number payloads 1 and 0, named On and Off. Wire both to Debug.','Each button produces the expected numeric command.'],
   ['Allow only valid output values','Insert a Switch that passes payload equal to number 0 or number 1. Test an extra Inject with value 2.','0 and 1 pass; 2 does not reach the output.'],
   ['Verify the circuit and pin mapping','Power down before wiring. With your instructor, verify the LED, current-limiting resistor, ground and chosen GPIO pin against your board documentation.','The circuit and numbering are checked before any output is enabled.'],
   ['Connect the hardware integration','Use an output node explicitly documented for your Pi model and operating system. Configure the checked pin and safe initial state. Keep Debug on a parallel branch.','The flow retains visible command logging alongside the hardware output.'],
   ['Test and finish off','Deploy, press On, then Off. Finish with Off and stop before changing the wiring.','The LED follows the commands and is left off.']
  ]
 },
 'iot-dashboard': {
  minutes:35,flow:['Inject: reading','Gauge + Chart'],requirements:['FlowFuse Dashboard nodes available in your Node-RED editor','A dashboard page and group'],
  build:'A small dashboard with a current-temperature gauge and a chart of readings.',result:'The gauge shows the most recent value and the chart displays a sequence of timestamped readings.',
  troubleshooting:'Check the selected page/group and widget visibility. Send numeric payloads. In the chart, configure the series and value properties to match the message.',
  source:'https://dashboard.flowfuse.com/nodes/widgets/ui-chart.html',
  steps:[
   ['Create sample readings','Add three Inject nodes with number payloads 22, 26 and 30. Set topic to room1 on each.','Each test message has the same topic and a different numeric value.'],
   ['Add a gauge','Add a FlowFuse Dashboard gauge to your page/group. Set its value to msg.payload and label it Temperature (°C). Use a 0–50 range.','The widget is configured to display the incoming number.'],
   ['Add a time-series chart','Add a chart to the same group. Configure a line/time-series display using topic for the series, payload for the value and message arrival time for the horizontal axis.','The chart can distinguish the series and place new readings in time.'],
   ['Connect and observe','Wire each Inject to both widgets. Deploy, open your configured dashboard path and inject the values a few seconds apart.','The gauge changes each time, and the chart shows three points.'],
   ['Make the display understandable','Add a text widget showing a last-update timestamp, supplied by a Change or Function node before that widget.','A viewer can distinguish a recent reading from a display that has stopped updating.','msg.payload = new Date().toISOString();\nreturn msg;','javascript']
  ]
 },
 'rest-api': {
  minutes:25,flow:['HTTP In: GET /api/hello','Function: response','HTTP Response'],requirements:['HTTP In and HTTP Response node guides','A browser or an HTTP client'],
  build:'A JSON endpoint that greets a supplied name and reports invalid input.',result:'A valid name returns HTTP 200 with a greeting; an omitted name returns HTTP 400 with an error.',
  troubleshooting:'Use the Node-RED server address, not this guide website address. Check the HTTP method/path, deploy changes, preserve msg.req/msg.res and ensure all paths reach HTTP Response.',
  steps:[
   ['Define the endpoint','Add HTTP In and select GET with URL /api/hello.','Requests to that method and path can trigger the flow after deployment.'],
   ['Validate and respond','Connect a Function and paste the example. The name comes from the URL query string.','The original message keeps its HTTP request/response context.','const name = msg.req.query.name;\nconst valid = typeof name === "string" && name.trim().length > 0;\nmsg.statusCode = valid ? 200 : 400;\nmsg.headers = { "Content-Type": "application/json" };\nmsg.payload = valid\n  ? { message: `Hello, ${name.trim()}` }\n  : { error: "A name query parameter is required" };\nreturn msg;','javascript'],
   ['Complete the response path','Connect Function to HTTP Response and deploy.','The request has a complete path back to the client.'],
   ['Try both outcomes','Visit http://localhost:1880/api/hello?name=Student and then the same URL without ?name=Student.','The first request returns a greeting; the second returns an error object.']
  ]
 },
 'database-logger': {
  minutes:45,flow:['Inject: number','Function: parameters','PostgreSQL','Debug'],requirements:['A separate practice PostgreSQL database','node-red-contrib-postgresql with a limited practice database account'],
  build:'A logger that inserts numeric readings using a parameterized query.',result:'Each valid injected reading creates one row with a generated ID and timestamp.',
  troubleshooting:'Confirm the database account can insert and select on the practice table. Keep the temperature numeric and supply parameters as an array. Never build SQL by concatenating user input.',
  source:'https://flows.nodered.org/node/node-red-contrib-postgresql',
  steps:[
   ['Create a practice table','Run this SQL in your practice database console. Keep the learning website database separate.','A readings table exists with a numeric value and recorded time.','CREATE TABLE readings (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  recorded_at timestamptz NOT NULL DEFAULT now(),\n  temperature double precision NOT NULL\n);','sql'],
   ['Validate and bind a reading','Set Inject payload to number 28. Connect a Function that prepares positional query parameters.','The reading becomes the first parameter; SQL and input remain separate.','if (typeof msg.payload !== "number" || !Number.isFinite(msg.payload)) return null;\nmsg.params = [msg.payload];\nreturn msg;','javascript'],
   ['Insert the value','Connect to node-red-contrib-postgresql using the practice connection. Put this query in its query field, then wire its output to Debug.','The database returns the inserted record.','INSERT INTO readings (temperature) VALUES ($1)\nRETURNING id, recorded_at, temperature;','sql'],
   ['Read the history','Deploy and inject a few readings. Run this query in the database console.','Recent readings appear with distinct IDs and timestamps.','SELECT id, recorded_at, temperature FROM readings\nORDER BY recorded_at DESC LIMIT 10;','sql']
  ]
 },
 'weather-api-dashboard': {
  minutes:35,flow:['Inject','HTTP Request','Function: temperature','Gauge'],requirements:['Internet access','HTTP Request and FlowFuse Dashboard gauge nodes'],
  build:'A dashboard that displays a current weather-model temperature from Open-Meteo.',result:'A successful request produces a numeric temperature on the gauge, labeled with the correct units.',
  troubleshooting:'Inspect HTTP status and the parsed response before accessing nested properties. The example uses Celsius and Taipei coordinates. Respect the service terms and avoid rapid repeated requests.',
  source:'https://open-meteo.com/en/docs',
  steps:[
   ['Request current temperature','Add Inject and HTTP Request. Set method GET and the URL below. Configure the response as a parsed JSON object.','The request asks for temperature_2m at the chosen coordinates.','https://api.open-meteo.com/v1/forecast?latitude=25.03&longitude=121.56&current=temperature_2m','text'],
   ['Inspect the response','Connect HTTP Request to a Debug configured for the complete message. Deploy and inject once.','A successful response has statusCode 200 and a current object in payload.'],
   ['Extract the value','Add a Function on the response path. It stops failed or unexpected responses.','A successful response becomes a numeric temperature.','if (msg.statusCode !== 200) { node.warn("Weather request failed"); return null; }\nconst value = msg.payload?.current?.temperature_2m;\nif (typeof value !== "number") return null;\nmsg.payload = value;\nreturn msg;','javascript'],
   ['Display it','Connect the Function to a gauge labeled Taipei temperature (°C), using msg.payload as its value. Deploy and request again.','The gauge shows the API value. It is weather-model data, not a measurement from your own sensor.']
  ]
 },
 'smart-home-simulation': {
  minutes:30,flow:['Inject: motion / temperature','Switch: topic','Function: decision','Debug'],requirements:['Switch and Function node guides','No physical devices are required'],
  build:'A simulated room controller that translates motion and temperature events into decisions.',result:'Motion true turns the simulated light on; temperature 31 turns the simulated fan on. Boundary values are tested.',
  troubleshooting:'Use boolean payloads for motion and numeric payloads for temperature. A string "false" is not boolean false. Match the topic exactly.',
  steps:[
   ['Create two event types','Add Inject nodes with topics room/motion and room/temperature. Use boolean true for motion and number 31 for temperature.','The topic identifies the event type and payload carries the value.'],
   ['Separate event paths','Use Switch on msg.topic with equality rules for room/motion and room/temperature.','Motion and temperature messages leave through different ports.'],
   ['Create light decisions','Connect the motion output to this Function and then a Debug named Light.','The simulated light is on only for a true motion event.','if (typeof msg.payload !== "boolean") return null;\nmsg.payload = { light: msg.payload ? "on" : "off" };\nreturn msg;','javascript'],
   ['Create fan decisions','Connect the temperature output to this Function and a Debug named Fan.','Values above 30 switch the simulated fan on.','if (typeof msg.payload !== "number" || !Number.isFinite(msg.payload)) return null;\nmsg.payload = { fan: msg.payload > 30 ? "on" : "off" };\nreturn msg;','javascript'],
   ['Test without hardware','Deploy and test motion true/false and temperatures 29, 30 and 31. Keep all outputs in Debug.','The two decisions behave independently and no physical device is controlled.']
  ]
 }
};
