package com.constructionpm.app.controller;

import com.constructionpm.app.dto.DelayPredictionDto;
import com.constructionpm.app.service.DelayPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delay-prediction")
@RequiredArgsConstructor
public class DelayPredictionController {

    private final DelayPredictionService predictionService;

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<DelayPredictionDto> predict(@PathVariable Long projectId) {
        return ResponseEntity.ok(predictionService.predict(projectId));
    }
}
