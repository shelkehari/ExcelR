package com.constructionpm.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConstructionPmApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConstructionPmApplication.class, args);
    }
}
