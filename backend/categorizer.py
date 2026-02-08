# auto categorization logic
def categorize_transaction(description, merchant):
    """
    auto categorize based on description and merchant info. This is a simple rule-based categorization logic, can be improved with more complex logic or even machine learning in the future. 
    easy to understand and maintain - can be easily extended with more rules as needed
    """

    text = (description + ' ' + (merchant or '')).lower()

    # dining
    food_keywords = [
        'restaurant', 'cafe', 'coffee', 'dining', 'starbucks', 'dunkin', 
        'mcdonald', 'pizza', 'burger', 'subway', 'chipotle', 'food', 
        'bar', 'bakery', 'doordash', 'ubereats', 'grubhub', 'postmates',
        # ADDITIONS based on my actual data:
        'noodle', 'noodles', 'dumpling', 'hot pot', 'beef', 'poke',
        'ai ki ya', 'jollibee', 'chahalo', 'chief beef', 'guo bao',
        'mala hotpot', 'teapsy', 'kung fu tea', 'hi tea', 'flower and dessert',
        'popeyes', 'wegmans', 'schine', 'fantuan', 'chowbus']
    if any(k in text for k in food_keywords):
        return 'Food & Dining'
    
    # shopping
    shopping_keywords = ['amazon', 'target', 'walmart', 'best buy', 'costco', 'store',
                         'mall', 'shop', 'retail', 'market', 'grocery',
                         # Additions based on my actual data:
                         'uniqlo', 'miniso', 'jewelry', 'luk fook', 'loewe', 'arcteryx',]
    if any(k in text for k in shopping_keywords):
        return 'Shopping'
    
    # transportation
    transportation_keywords = ['uber', 'lyft', 'gas', 'fuel', 'parking', 'transit',
                               'metro', 'car']
    if any(k in text for k in transportation_keywords):
        return 'Transportation'
    
    # entertainment
    entertainment_keywords = ['spotify', 'movie', 'regal', 'amc', 'theater',
                              'game', 'concert', 'ticket', 'entertainment']
    if any(k in text for k in entertainment_keywords):
        return 'Entertainment'
    
    # utilities
    bills_keywords = ['electric', 'water', 'internet', 'phone', 'utility',
        'insurance', 'rent', 'payment', 'ach deposit','anthropic']
    if any(k in text for k in bills_keywords):
        return 'Bills & Utilities'
    
    # health
    health_keywords = ['pharmacy', 'cvs', 'walgreens', 'clinic', 'hospital',
                       'health', 'doctor', 'dentist']
    if any(k in text for k in health_keywords):
        return "Health & Wellness"
    
    # default to uncategorize
    return 'Other'


# auto categorization based on description and merchant info. 
# This is a simple rule-based categorization logic, can be improved with more complex logic or even machine learning in the future.
# The cons are that it may not be as accurate as more complex methods, 
# The pros are that it's easy to understand and maintain, and can be easily extended with more rules as needed.