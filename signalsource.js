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

var SignalSource = {
    buffer : false,
    fillFactor : 0.5,
    audioContext : false,
    source : false,
    
    config : {
        pwmOutputFreq : 10000,
        duration : 0.05,
        amplitude: 1,
        decreaseFillFactorFreq : 440,
        increaseFillFactorFreq : 4400
    },
    
    updatePwmChannel : function (pwmData){
        var omegaStep = 2 * Math.PI * this.config.pwmOutputFreq / this.audioContext.sampleRate;
        var omega = 0;
        
        // plain PWM for now.
        var numOfSkippedSamples = Math.round (buffLen * this.fillFactor);
        
        for (var i = 0; i < pwmData.length; i++) {
            
            if (i > numOfSkippedSamples)
                pwmData [i] = 0;
            else
                pwmData [i] = this.config.amplitude * Math.sin(omega);
                
            omega += omegaStep;
        }        
    },
    
    updateCommandChannel : function (commandData) {
        var decreaseFillFactorOmegaStep = 2 * Math.PI * this.config.decreaseFillFactorFreq / this.audioContext.sampleRate;
        var decreaseFillFactorOmega = 0;
        
        var increaseFillFactorOmegaStep = 2 * Math.PI * this.config.increaseFillFactorFreq / this.audioContext.sampleRate;
        var increaseFillFactorOmega = 0;

        var cmdAmplitude = 0.5 * this.config.amplitude;
        for (var i = 0; i < commandData.length; i++) {
            commandData [i] =  cmdAmplitude * (Math.sin(decreaseFillFactorOmega) + Math.sin(increaseFillFactorOmega));
            decreaseFillFactorOmega += decreaseFillFactorOmegaStep;
            increaseFillFactorOmega += increaseFillFactorOmegaStep;
        }        
    },
    
    updateBuffer : function () {
    
        if (!this.audioContext)
            this.audioContext = new AudioContext();
            
        var buffLen = this.audioContext.sampleRate * this.config.duration;
        
        if (!this.buffer)
            this.buffer = this.audioContext.createBuffer(2, buffLen, this.audioContext.sampleRate);

        var pwmData = this.buffer.getChannelData(0);
        this.updatePwmChannel (pwmData);
        
        var commandData = this.buffer.getChannelData(1);
        this.updateCommandChannel (commandData);
        
        if (!!this.source) {
            this.source.stop();
            delete this.source;
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = true;
    }
};
