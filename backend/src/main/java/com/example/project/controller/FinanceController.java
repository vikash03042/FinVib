package com.example.project.controller;

import com.example.project.dto.ChatRequest;
import com.example.project.dto.ChatResponse;
import com.example.project.repository.entity.Expense;
import com.example.project.repository.entity.Income;
import com.example.project.security.CustomUserDetails;
import com.example.project.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow React frontend to connect
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    // --- EXPENSES ENDPOINTS ---

    @PostMapping("/expenses")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(financeService.saveExpense(expense, userDetails.getUser()));
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(financeService.getAllExpenses(userDetails.getUser()));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteExpense(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        financeService.deleteExpense(id, userDetails.getUser());
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/today")
    public ResponseEntity<Map<String, BigDecimal>> getTodayExpense(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getTodayExpenseSum(userDetails.getUser()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/week")
    public ResponseEntity<Map<String, BigDecimal>> getWeeklyExpense(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getWeeklyExpenseSum(userDetails.getUser()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalExpense(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("total", financeService.getTotalExpenseSum(userDetails.getUser()));
        return ResponseEntity.ok(response);
    }

    // --- INCOME ENDPOINTS ---

    @PostMapping("/income")
    public ResponseEntity<Income> addIncome(@RequestBody Income income, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(financeService.saveIncome(income, userDetails.getUser()));
    }

    @GetMapping("/income")
    public ResponseEntity<List<Income>> getAllIncomes(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(financeService.getAllIncomes(userDetails.getUser()));
    }

    @DeleteMapping("/income/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteIncome(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        financeService.deleteIncome(id, userDetails.getUser());
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    // --- DASHBOARD SUMMARY ENDPOINT ---

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@AuthenticationPrincipal CustomUserDetails userDetails) {
        BigDecimal totalIncome = financeService.getTotalIncomeSum(userDetails.getUser());
        BigDecimal totalExpense = financeService.getTotalExpenseSum(userDetails.getUser());
        BigDecimal totalBalance = totalIncome.subtract(totalExpense);
        BigDecimal weeklyExpense = financeService.getWeeklyExpenseSum(userDetails.getUser());
        BigDecimal monthlyExpense = financeService.getMonthlyExpenseSum(userDetails.getUser());

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
    public ResponseEntity<ChatResponse> processChat(@RequestBody ChatRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        String answer = financeService.processChat(request.getMessage(), userDetails.getUser());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}
