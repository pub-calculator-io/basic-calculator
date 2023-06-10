const BasicCalculator = {
  inputField: _('input_field'),
  expression: '',

  config: {
    precision: 9,
    inputs: ['0','1','2','3','4','5','6','7','8','9','.'],
    actions: ['AC','BACK','%','/','*','+','-','=','±'],
    binaryOperators: ['/','*','-','+'],
    leftOperators: [],
    rightOperators: [],
    inputsMap: {
      'Backspace': 'BACK', 'Enter': '=',
      'Escape': 'AC', '_': '±', ',': '.'
    },
    actionsMap: {
      '−':'-', '×':'*', '÷':'/'
    },
  },

  calc(expression){
    try{
      return math.evaluate(expression).toString();
    }
    catch(error){
      return 'Error';
    }
  },

  initMath(){
    math.config({number: 'BigNumber', precision: this.config.precision});
  },

  action(op){
    // init
    let {value, expression} = this.initValues();
    const config = this.config;

    // binary operators
    if(config.binaryOperators.includes(op)){
      expression+= value + op;
      value = '0'; // ''
      this.activateAction(op);
    }

    // other keys
    switch(op){
      case '=':
        expression+= value;
        value = this.calc(expression);
        expression+= '=' + value;
        this.activateAction(op);
      break;

      case '±':
        if(value == '0') break;
        if(value[0] == '-')
          value = value.slice(1);
        else
          value = '-' + value;
        this.setAction('±',value[0] == '-');
      break;

      case '%':
        if(value[value.length-1] == '%')
          value = value.slice(0,-1);
        else
          value+= '%';
        this.setAction('%',value[value.length - 1] == '%');
      break;

      case 'AC':
        value = '0';
        expression = '';
        this.deactivateActions();
      break;

      case 'BACK':
        value = value.slice(0,-1);
      break;
    }

    // output
    this.inputField.value = value;
    this.expression = expression;
    console.log(`${value}, ${expression}`);
  },


  initValues(){
    let value = this.inputField.value || '0';
    let expression = this.expression;
    const evaluated = expression.indexOf('=') != -1;
    const error = ['NaN','Error','Infinity','-Infinity'].includes(value);
    
    if(error){
      value = '0';
    }

    if(evaluated || error){
      expression = '';
      this.deactivateActions();
    }

    return {value,expression};
  },

  input(key){
    // init
    let {value, expression} = this.initValues();

    // check value
    if(key == '.' && value.indexOf('.') != -1) return;
    if(key != '%' && value.indexOf('%') != -1) return;

    // set value
    value = (
      value == '0' && key != '.' ? 
      key : value + key
    );
    
    if(value.length > this.config.precision) return;

    // output
    this.inputField.value = value;
    this.expression = expression;
  },

  inputKeydown(event){
    // map keys
    let key = event.key;
    key = this.config.inputsMap[key] || key;
    let keyHandled = false;

    // action keys
    if(this.config.actions.includes(key)) {
      this.action(key);
      keyHandled = true;
    }

    // printalbe keys
    if(this.config.inputs.includes(key)) {
      this.input(key);
      keyHandled = true;
    }

    // don't stop event
    if (
      // for keys combinations
      ['Meta','Control','Alt'].some(state => event.getModifierState(state)) ||
      // for special keys, excluding which ones handled
      event.key.length > 1 && !keyHandled ||
      // for global event
      event.target.id != 'input_field' && event.code != 'NumpadDivide' // fix for some browsers
    ) return;
    
    event.preventDefault();
    event.stopPropagation();
  },

  buttonClick(event){
    if(!event.clientX && !event.clientY) return; // stops recognizing ENTER as a click
    if(event.target.tagName != "BUTTON") return;
    
    // map keys
    let key = event.target.innerText;
    key = this.config.actionsMap[key] || key; 
  
    // action keys
    if(this.config.actions.includes(key)){
      this.action(key);
    }
  
    // printable keys
    if(this.config.inputs.includes(key)){
      this.input(key);
    }
  },
  
  setAction(key, state){
    const button = $(`button[data-action="${key}"]`);
    button && button.classList[state?'add':'remove']('basic-button--active');
  },

  activateAction(key){
    this.deactivateActions();
    this.setAction(key, true);
  },

  deactivateActions() {
    $$('button[data-action].basic-button--active').forEach(button => {
      button.classList.remove('basic-button--active')
    });
  },

};

window.addEventListener('load', () => BasicCalculator.initMath())
window.addEventListener('keydown', event => BasicCalculator.inputKeydown(event))