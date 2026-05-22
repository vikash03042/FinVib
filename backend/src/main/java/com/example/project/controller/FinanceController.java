package com.example.project.controller;

import com.example.project.dto.ChatRequest;
import com.example.project.dto.ChatResponse;
import com.example.project.repository.entity.Expense;
import com.example.project.repository.entity.Income;
import com.example.project.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = "*") // Allow React frontend to connect
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    // --- EXPENSES ENDPOINTS ---

    @PostMapping("/expenses")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.saveExpense(expense));
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(financeService.getAllExpenses());
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteExpense(@PathVariable Long id) {
        financeService.deleteExpense(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/today")
    public ResponseEntity<Map<String, BigDecimal>> getTodayExpense() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getTodayExpenseSum());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/week")
    public ResponseEntity<Map<String, BigDecimal>> getWeeklyExpense() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getWeeklyExpenseSum());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalExpense() {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getTotalExpenseSum());
        return ResponseEntity.ok(response);
    }

    // --- INCOME ENDPOINTS ---

    @PostMapping("/income")
    public ResponseEntity<Income> addIncome(@RequestBody Income income) {
        return ResponseEntity.ok(financeService.saveIncome(income));
    }

    @GetMapping("/income")
    public ResponseEntity<List<Income>> getAllIncomes() {
        return ResponseEntity.ok(financeService.getAllIncomes());
    }

    @DeleteMapping("/income/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteIncome(@PathVariable Long id) {
        financeService.deleteIncome(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    // --- DASHBOARD SUMMARY ENDPOINT ---

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        BigDecimal totalIncome = financeService.getTotalIncomeSum();
        BigDecimal totalExpense = financeService.getTotalExpenseSum();
        BigDecimal totalBalance = totalIncome.subtract(totalExpense);
        BigDecimal weeklyExpense = financeService.getWeeklyExpenseSum();
        BigDecimal monthlyExpense = financeService.getMonthlyExpenseSum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBalance", totalBalance);
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("weeklyExpense", weeklyExpense);
        summary.put("monthlyExpense", monthlyExpense);

        return ResponseEntity.ok(summary);
    }

    // --- CHATBOT ENDPOINT ---

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> processChat(@RequestBody ChatRequest request) {
        String answer = financeService.processChat(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}
