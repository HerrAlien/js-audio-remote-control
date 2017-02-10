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

var MicrophoneInput = {
    node : false,
    onFinishedInit : {
        funcs : [],
        add : function (func) {
            this.funcs.append(func);
        },
        run : function () {
            for (var i = 0; i < this.funcs.length; i++)
                if (!!this.funcs[i])
                    this.funcs[i]();
        }
    },

    init : function (audioCtx) {
        if (!!this.node) {
            delete this.node;
            this.node = false;
        }
        
        navigator.mediaDevices.getUserMedia ({audio: true, video: false}).then (function(stream){
            MicrophoneInput.node = audioCtx.createMediaStreamSource(stream);
            MicrophoneInput.onFinishedInit.run();
        });
    }
};
