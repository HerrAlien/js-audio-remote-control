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

var IIRLowPassFilter = {
    node : false,
    inputEffectiveValue : 0,
    filteredEffectiveValue : 0,
    
    internal : {
        bufferLength : 4096,
        processingLength : 256,
        signalPresenceThreshold : 26,
        passRejectThreshold : 128,
        filteredValues : []
    },
    
    init : function (audioCtx) {
        if (!!this.node) {
            delete this.node;
            this.node = false;
        }
        
        if (!!this.sink){
            delete this.sink;
            this.sink = false;
        }
        
        this.node = audioCtx.createScriptProcessor(this.internal.bufferLength, 1, 1);
        this.sink = audioCtx.createGain();
        
        this.node.onaudioprocess = function (audioProcessingEvent) {
            IIRLowPassFilter.filterData(audioProcessingEvent);
        }
        
        this.node.connect(audioCtx.destination);
        
/*        navigator.mediaDevices.getUserMedia ({audio: true, video: false}).then (function(stream){
            var source = audioCtx.createMediaStreamSource(stream);
            source.connect (IIRLowPassFilter.node);
        }) */
    },
    
    onPassBand : false,
    onRejectBand : false,
    
    filterData : function (audioProcessingEvent) {
        this.inputEffectiveValue = 0;
        this.filteredEffectiveValue = 0;
        
        var data = audioProcessingEvent.inputBuffer.getChannelData (0);
        this.internal.filteredValues[0] = 0;
        for (var i = 1; i < this.internal.processingLength; i++){
            this.inputEffectiveValue += Math.abs (data[i]);
            this.internal.filteredValues[i] = 0.15 * data [i] + 0.85 * this.internal.filteredValues[i - 1];
            this.filteredEffectiveValue += Math.abs (this.internal.filteredValues[i]);
        }
        
        if (this.inputEffectiveValue > this.internal.signalPresenceThreshold) {
            if (this.filteredEffectiveValue > this.internal.passRejectThreshold) {
                if (!!this.onPassBand)
                    this.onPassBand();
            } else {
                if (!!this.onRejectBand)
                    this.onRejectBand();
            }
        }
    }
};
