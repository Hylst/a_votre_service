/**
 * CryptoConverter.tsx
 * Cryptocurrency converter with real-time prices
 * Converts between various cryptocurrencies and fiat currencies
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bitcoin, RefreshCw, ArrowUpDown, TrendingUp, TrendingDown, Bell, Wallet, Target, Plus, Trash2 } from 'lucide-react';
import { FinancialWarning } from '@/components/ui/financial-warning';

interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface FiatCurrency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  date: string;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

interface PriceHistory {
  date: string;
  price: number;
  timestamp: number;
}

export const CryptoConverter = () => {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("bitcoin");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [result, setResult] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Enhanced features state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [priceHistory, setPriceHistory] = useState<{[key: string]: PriceHistory[]}>({});
  const [newPortfolioItem, setNewPortfolioItem] = useState({ symbol: 'BTC', amount: '', buyPrice: '' });
  const [newAlert, setNewAlert] = useState({ symbol: 'BTC', targetPrice: '', condition: 'above' as 'above' | 'below' });
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');

  // Mock data for demonstration - in real app, this would come from an API
  const [cryptoData, setCryptoData] = useState<CryptoCurrency[]>([
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      price: 45230.50,
      change24h: 2.34,
      marketCap: 885000000000
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      price: 2890.75,
      change24h: -1.23,
      marketCap: 347000000000
    },
    {
      id: "binancecoin",
      symbol: "BNB",
      name: "Binance Coin",
      price: 315.20,
      change24h: 0.87,
      marketCap: 48500000000
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      price: 0.52,
      change24h: 3.45,
      marketCap: 18200000000
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      price: 98.45,
      change24h: -2.10,
      marketCap: 42800000000
    },
    {
      id: "dogecoin",
      symbol: "DOGE",
      name: "Dogecoin",
      price: 0.085,
      change24h: 5.67,
      marketCap: 12100000000
    }
  ]);

  const fiatCurrencies: FiatCurrency[] = [
    { code: "EUR", name: "Euro", symbol: "€", rate: 1 },
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1.08 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.87 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 162.50 },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.95 },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.47 }
  ];

  /**
   * Simulate fetching real-time crypto prices
   */
  const fetchCryptoPrices = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate price fluctuations
    setCryptoData(prevData => 
      prevData.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% fluctuation
        change24h: crypto.change24h + (Math.random() - 0.5) * 2 // ±1% change in 24h change
      }))
    );
    
    setLastUpdate(new Date());
    setLoading(false);
  };

  /**
   * Convert between currencies
   */
  const convertCurrency = () => {
    const amountNum = parseFloat(amount) || 0;
    
    // Get source currency data
    let fromPrice = 1;
    const fromCrypto = cryptoData.find(crypto => crypto.id === fromCurrency);
    const fromFiat = fiatCurrencies.find(fiat => fiat.code === fromCurrency);
    
    if (fromCrypto) {
      fromPrice = fromCrypto.price;
    } else if (fromFiat) {
      fromPrice = fromFiat.rate;
    }
    
    // Get target currency data
    let toPrice = 1;
    const toCrypto = cryptoData.find(crypto => crypto.id === toCurrency);
    const toFiat = fiatCurrencies.find(fiat => fiat.code === toCurrency);
    
    if (toCrypto) {
      toPrice = toCrypto.price;
    } else if (toFiat) {
      toPrice = toFiat.rate;
    }
    
    // Convert: amount * fromPrice / toPrice
    const convertedAmount = (amountNum * fromPrice) / toPrice;
    setResult(convertedAmount);
  };

  /**
   * Swap from and to currencies
   */
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  /**
   * Get currency display info
   */
  const getCurrencyInfo = (currencyId: string) => {
    const crypto = cryptoData.find(c => c.id === currencyId);
    const fiat = fiatCurrencies.find(f => f.code === currencyId);
    
    if (crypto) {
      return {
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price,
        change24h: crypto.change24h,
        isCrypto: true
      };
    } else if (fiat) {
      return {
        symbol: fiat.code,
        name: fiat.name,
        price: fiat.rate,
        change24h: 0,
        isCrypto: false
      };
    }
    
    return null;
  };

  /**
   * Format currency value
   */
  const formatCurrency = (value: number, currencyId: string): string => {
    const info = getCurrencyInfo(currencyId);
    if (!info) return value.toString();
    
    if (info.isCrypto) {
      return value.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      });
    } else {
      return value.toLocaleString('fr-FR', {
        style: 'currency',
        currency: currencyId
      });
    }
  };

  // Portfolio management functions
  const addPortfolioItem = () => {
    if (!newPortfolioItem.amount || !newPortfolioItem.buyPrice) return;
    
    const crypto = cryptoData.find(c => c.symbol === newPortfolioItem.symbol);
    if (!crypto) return;
    
    const item: PortfolioItem = {
      id: Date.now().toString(),
      symbol: newPortfolioItem.symbol,
      amount: parseFloat(newPortfolioItem.amount),
      buyPrice: parseFloat(newPortfolioItem.buyPrice),
      currentPrice: crypto.price,
      date: new Date().toISOString().split('T')[0]
    };
    
    setPortfolio(prev => [...prev, item]);
    setNewPortfolioItem({ symbol: 'BTC', amount: '', buyPrice: '' });
  };

  const removePortfolioItem = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  const calculatePortfolioStats = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.amount * item.buyPrice), 0);
    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    return { totalValue, totalInvested, totalPnL, totalPnLPercent };
  };

  // Price alerts functions
  const addPriceAlert = () => {
    if (!newAlert.targetPrice) return;
    
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      isActive: true
    };
    
    setPriceAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: 'BTC', targetPrice: '', condition: 'above' });
  };

  const removePriceAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const checkPriceAlerts = () => {
    priceAlerts.forEach(alert => {
      const crypto = cryptoData.find(c => c.symbol === alert.symbol);
      if (!crypto || !alert.isActive) return;
      
      const shouldTrigger = alert.condition === 'above' 
        ? crypto.price >= alert.targetPrice
        : crypto.price <= alert.targetPrice;
        
      if (shouldTrigger) {
        // In a real app, this would show a notification
        console.log(`Alert triggered: ${alert.symbol} is ${alert.condition} ${alert.targetPrice}`);
      }
    });
  };

  // Generate mock historical data
  const generatePriceHistory = (symbol: string): PriceHistory[] => {
    const crypto = cryptoData.find(c => c.symbol === symbol);
    if (!crypto) return [];
    
    const history: PriceHistory[] = [];
    const currentPrice = crypto.price;
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = currentPrice * (1 + variation * (i / days));
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 0),
        timestamp: date.getTime()
      });
    }
    
    return history;
  };

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, cryptoData]);

  useEffect(() => {
    // Auto-refresh prices every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoPrices();
      checkPriceAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [priceAlerts]);

  useEffect(() => {
    // Generate historical data for all cryptos
    const newHistory: {[key: string]: PriceHistory[]} = {};
    cryptoData.forEach(crypto => {
      newHistory[crypto.symbol] = generatePriceHistory(crypto.symbol);
    });
    setPriceHistory(newHistory);
  }, [cryptoData]);

  useEffect(() => {
    // Update portfolio current prices
    setPortfolio(prev => prev.map(item => {
      const crypto = cryptoData.find(c => c.symbol === item.symbol);
      return crypto ? { ...item, currentPrice: crypto.price } : item;
    }));
  }, [cryptoData]);

  const fromInfo = getCurrencyInfo(fromCurrency);
  const toInfo = getCurrencyInfo(toCurrency);

  const portfolioStats = calculatePortfolioStats();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bitcoin className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-foreground">Convertisseur Crypto Avancé</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Dernière MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCryptoPrices}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="converter">Convertisseur</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Converter */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Convertisseur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Currency */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant à convertir"
                  className="flex-1 bg-background text-foreground"
                />
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-32 bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cryptomonnaies */}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                      Cryptomonnaies
                    </div>
                    {cryptoData.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        {crypto.symbol}
                      </SelectItem>
                    ))}
                    {/* Devises */}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b mt-2">
                      Devises
                    </div>
                    {fiatCurrencies.map((fiat) => (
                      <SelectItem key={fiat.code} value={fiat.code}>
                        {fiat.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fromInfo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{fromInfo.name}</span>
                  {fromInfo.isCrypto && (
                    <Badge variant={fromInfo.change24h >= 0 ? "default" : "destructive"}>
                      {fromInfo.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(fromInfo.change24h).toFixed(2)}%
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapCurrencies}
                className="rounded-full p-2"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <Label htmlFor="result">Résultat</Label>
              <div className="flex gap-2">
                <Input
                  id="result"
                  type="text"
                  value={formatCurrency(result, toCurrency)}
                  readOnly
                  className="flex-1 bg-secondary text-foreground font-mono"
                />
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-32 bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cryptomonnaies */}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                      Cryptomonnaies
                    </div>
                    {cryptoData.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        {crypto.symbol}
                      </SelectItem>
                    ))}
                    {/* Devises */}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b mt-2">
                      Devises
                    </div>
                    {fiatCurrencies.map((fiat) => (
                      <SelectItem key={fiat.code} value={fiat.code}>
                        {fiat.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {toInfo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{toInfo.name}</span>
                  {toInfo.isCrypto && (
                    <Badge variant={toInfo.change24h >= 0 ? "default" : "destructive"}>
                      {toInfo.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(toInfo.change24h).toFixed(2)}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Aperçu du Marché</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cryptoData.map((crypto) => (
                <div key={crypto.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {crypto.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {crypto.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {crypto.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(crypto.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Convert Buttons */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Conversions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["0.1", "1", "10", "100"].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => setAmount(quickAmount)}
                className="text-sm"
              >
                {quickAmount} {fromInfo?.symbol || ''}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price History Chart */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Historique des Prix (30j)
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger className="w-32 bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory[selectedCrypto] || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `€${value.toLocaleString('fr-FR')}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`€${value.toLocaleString('fr-FR')}`, 'Prix']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Performance */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>Performance du Marché (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cryptoData.map((crypto, index) => {
                    const changeColor = crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500';
                    return (
                      <div key={crypto.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <div className="font-medium text-foreground">{crypto.symbol}</div>
                            <div className="text-xs text-muted-foreground">{crypto.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {crypto.price.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </div>
                          <div className={`text-sm font-medium ${changeColor}`}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Valeur Totale</div>
                <div className="text-2xl font-bold text-foreground">
                  €{portfolioStats.totalValue.toLocaleString('fr-FR')}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Investi</div>
                <div className="text-2xl font-bold text-foreground">
                  €{portfolioStats.totalInvested.toLocaleString('fr-FR')}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">P&L</div>
                <div className={`text-2xl font-bold ${
                  portfolioStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  €{portfolioStats.totalPnL.toLocaleString('fr-FR')}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">P&L %</div>
                <div className={`text-2xl font-bold ${
                  portfolioStats.totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {portfolioStats.totalPnLPercent.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Portfolio Item */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter au Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Select 
                    value={newPortfolioItem.symbol} 
                    onValueChange={(value) => setNewPortfolioItem(prev => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Quantité"
                    value={newPortfolioItem.amount}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-background text-foreground"
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Prix d'achat"
                    value={newPortfolioItem.buyPrice}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, buyPrice: e.target.value }))}
                    className="bg-background text-foreground"
                  />
                </div>
                <Button onClick={addPortfolioItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio Items */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Mes Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {portfolio.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Aucune position dans le portfolio
                    </div>
                  ) : (
                    portfolio.map((item) => {
                      const pnl = (item.currentPrice - item.buyPrice) * item.amount;
                      const pnlPercent = ((item.currentPrice - item.buyPrice) / item.buyPrice) * 100;
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{item.symbol}</span>
                              <span className="text-sm text-muted-foreground">{item.amount}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Acheté à €{item.buyPrice.toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              pnl >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              €{pnl.toLocaleString('fr-FR')}
                            </div>
                            <div className={`text-xs ${
                              pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioItem(item.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Price Alert */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Créer une Alerte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={newAlert.symbol} 
                    onValueChange={(value) => setNewAlert(prev => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={newAlert.condition} 
                    onValueChange={(value: 'above' | 'below') => setNewAlert(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Au-dessus de</SelectItem>
                      <SelectItem value="below">En-dessous de</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  step="any"
                  placeholder="Prix cible (€)"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                  className="bg-background text-foreground"
                />
                <Button onClick={addPriceAlert} className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Créer l'Alerte
                </Button>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Alertes Actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {priceAlerts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Aucune alerte configurée
                    </div>
                  ) : (
                    priceAlerts.map((alert) => {
                      const crypto = cryptoData.find(c => c.symbol === alert.symbol);
                      const currentPrice = crypto?.price || 0;
                      const isTriggered = alert.condition === 'above' 
                        ? currentPrice >= alert.targetPrice
                        : currentPrice <= alert.targetPrice;
                      
                      return (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{alert.symbol}</span>
                              <Badge variant={isTriggered ? "destructive" : "default"}>
                                {alert.condition === 'above' ? '↗' : '↘'} €{alert.targetPrice.toLocaleString('fr-FR')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Prix actuel: €{currentPrice.toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePriceAlert(alert.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Status */}
          {priceAlerts.some(alert => {
            const crypto = cryptoData.find(c => c.symbol === alert.symbol);
            const currentPrice = crypto?.price || 0;
            return alert.condition === 'above' 
              ? currentPrice >= alert.targetPrice
              : currentPrice <= alert.targetPrice;
          }) && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Une ou plusieurs alertes ont été déclenchées ! Vérifiez vos positions.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Mode d'emploi et conseils */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Bitcoin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-3">Mode d'emploi et conseils :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>🔄 Conversion :</strong> Sélectionnez les devises et saisissez le montant pour une conversion instantanée</p>
                  <p><strong>📊 Suivi portefeuille :</strong> Ajoutez vos positions pour suivre vos gains/pertes en temps réel</p>
                  <p><strong>🔔 Alertes prix :</strong> Configurez des notifications pour ne rater aucune opportunité</p>
                  <p><strong>📈 Graphiques :</strong> Analysez l'évolution des prix sur 30 jours</p>
                </div>
                <div className="space-y-2">
                  <p><strong>⚠️ Volatilité :</strong> Les cryptos sont très volatiles, investissez prudemment</p>
                  <p><strong>🔐 Sécurité :</strong> Utilisez des wallets sécurisés et activez l'authentification 2FA</p>
                  <p><strong>📚 Formation :</strong> Étudiez les projets avant d'investir (whitepaper, équipe, roadmap)</p>
                  <p><strong>💰 Diversification :</strong> Ne mettez pas tous vos œufs dans le même panier crypto</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Avertissement financier */}
      <FinancialWarning />
    </div>
   );
 };