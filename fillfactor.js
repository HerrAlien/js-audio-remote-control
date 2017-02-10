/*
js-audio-remote-controll - a JavaScript utility to generate PWM AC audio output,
with a fill factor dictated by microphone inputs
               
Copyright 2017  Herr_Alien <alexandru.garofide@gmail.com>
                
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
                
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
                
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl.html
*/

var FillFactor = {

    data : {
        value : 500,
        _min : 250,
        _max : 1000
    },
    
    view : false,
    
    control : {
        up: false,
        down: false 
    },
    
    __increment__ : {
        values : {
            normal : 1,
            fast : 10,
            ultra : 50,
            current : "normal"
        },
        consecutiveChangesCounter : 0,
        wasLastOpIncrement: false,
        //! after that many consecutive changes in one direction, we increase the speed
        consecutiveChangesStepUp : 25,
        
        getValue : function () {
            if (this.consecutiveChangesCounter++ > this.consecutiveChangesStepUp){
                if (this.values.current == "normal" )
                    this.values.current = "fast";
                else if (this.values.current == "fast")
                    this.values.current = "ultra";
                    
                this.consecutiveChangesCounter = 0;
            }
            return this.values[this.values.current];
        },
        
        reset : function () {
            this.values.current = "normal";
            this.consecutiveChangesCounter = 0;
        }
    },
    
    setValue : function (val) {
        if (val < this.data._min)
            val = this.data._min;
        else if (val > this.data._max)
            val = this.data._max;
        this.data.value = val;
        this.onchange.runcbs();
    },
    
    getValue : function () {
        return this.data.value / 1000;
    },
    
    increment : function () {
        if (!FillFactor.wasLastOpIncrement)
            FillFactor.__increment__.reset();
        FillFactor.setValue (FillFactor.data.value + FillFactor.__increment__.getValue());
        FillFactor.wasLastOpIncrement = true;
        return FillFactor.data.value;
    },
        
    decrement : function () {
        if (FillFactor.wasLastOpIncrement)
            FillFactor.__increment__.reset();
        FillFactor.setValue (FillFactor.data.value - FillFactor.__increment__.getValue());
        FillFactor.wasLastOpIncrement = false;
        return FillFactor.data.value;
    },

    onchange : {
        funcs : [],
        add : function (cb) {
            this.funcs.push (cb);
        },
        runcbs : function () {
            for (var i = 0; i < this.funcs.length; i++)
                if (this.funcs[i]) this.funcs[i]();
        }
    },
    
    init : function () {
        // associate with HTMLs 
        this.view = document.getElementById("fillfactor");
        this.control.up = document.getElementById("up");
        this.control.down = document.getElementById("down");

        this.view.readonly = true;
        this.control.up.onclick = this.increment;
        this.control.down.onclick = this.decrement;
        this.onchange.add (function() { FillFactor.view.value =  FillFactor.data.value; } );
    }

};
