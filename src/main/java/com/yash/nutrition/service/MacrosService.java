package com.yash.nutrition.service;

import org.springframework.stereotype.Service;

@Service
public class MacrosService {

    public double[] macrosGrams(int calories, double pPct, double fPct, double cPct) {
        // kcal per gram: protein 4, carbs 4, fat 9
        double pGr = (calories * (pPct/100.0)) / 4.0;
        double fGr = (calories * (fPct/100.0)) / 9.0;
        double cGr = (calories * (cPct/100.0)) / 4.0;
        return new double[]{ pGr, fGr, cGr };
    }

    public double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}
